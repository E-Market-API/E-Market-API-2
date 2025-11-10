import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
} from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { userSchema } from '../validations/userSchema.js';
import { profile } from '../controllers/UserController.js';
const router = express.Router();

const loginSchema = userSchema.pick(['email', 'password']);

router.post('/register', validate(userSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Example of protected route
// router.get('/profile', isAuthenticated, (req, res) => {
//   console.log(req);

//   res.json({ message: `Welcome, user ${req.user.id}`, user: req.user });
// });
router.get('/profile', isAuthenticated, profile);

export default router;
