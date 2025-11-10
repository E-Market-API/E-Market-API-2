import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CartService from '../services/cartService.js';
import RefreshToken from '../models/RefreshToken.js';

const ACCESS_TOKEN_EXP = '15m';
const REFRESH_TOKEN_EXP = '7d';

// generate access + refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXP }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXP }
  );

  return { accessToken, refreshToken };
};

// set cookie
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// send user + access token
const sendUserResponse = (res, user, accessToken) => {
  res.status(200).json({
    message: 'Success',
    data: {
      accessToken,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ fullname, email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    const decoded = jwt.decode(refreshToken);

    // store refresh token in DB
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decoded.exp * 1000),
    });

    setRefreshCookie(res, refreshToken);

    const sessionId = req.headers['session-id'];
    if (sessionId) await CartService.mergeCarts(user._id, sessionId);

    sendUserResponse(res, user, accessToken);
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    const decoded = jwt.decode(refreshToken);

    // delete any old refresh tokens (optional cleanup)
    await RefreshToken.deleteMany({ user: user._id });

    // store new token
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decoded.exp * 1000),
    });

    setRefreshCookie(res, refreshToken);

    const sessionId = req.headers['session-id'];
    if (sessionId) await CartService.mergeCarts(user._id, sessionId);

    sendUserResponse(res, user, accessToken);
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN (uses whitelist)
export const refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token)
    return res.status(401).json({ message: 'No refresh token found' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // check if token is still valid in DB
    const storedToken = await RefreshToken.findOne({ user: payload.id, token });
    if (!storedToken)
      return res.status(401).json({ message: 'Refresh token revoked' });

    // generate new tokens
    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXP }
    );

    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXP }
    );

    // remove old token and add new one
    const decodedNew = jwt.decode(newRefreshToken);
    await RefreshToken.deleteOne({ token });
    await RefreshToken.create({
      user: payload.id,
      token: newRefreshToken,
      expiresAt: new Date(decodedNew.exp * 1000),
    });

    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  const token = req.cookies?.refresh_token;

  if (token) {
    await RefreshToken.deleteOne({ token });
  }

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
