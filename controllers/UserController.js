import User from "../models/User.js";

export const createUser = async (req, res, next) => {
  try {
    // if first user role = admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : req.body.role || "user";

    const user = new User(req.body, role);
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Find the user by ID and delete
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};


export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().notDeleted();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// Soft delete user
export const softDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.softDelete();
    res.status(200).json({ message: "User soft deleted" });
  } catch (error) {
    next(error);
  }
};

// Restore user
export const restoreUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.restore();
    res.status(200).json({ message: "User restored" });
  } catch (error) {
    next(error);
  }
};

// Get all soft-deleted users
export const getDeletedUsers = async (req, res, next) => {
  try {
    const users = await User.find().deleted();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};