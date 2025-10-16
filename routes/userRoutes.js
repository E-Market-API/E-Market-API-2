import express from "express";
import * as userController from "../controllers/UserController.js";
import validate from "../middlewares/validate.js";
import { userSchema } from "../validations/userSchema.js";
import { checkOwnership } from "../middlewares/ownershipMiddleware.js";
import { createUpload } from "../config/multerConfig.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/roles.js";


const router = express.Router();

router.post("/", validate(userSchema), userController.createUser);
router.get("/", userController.getUsers);
router.get("/deleted", userController.getDeletedUsers);

router.get("/:id", userController.getUserById);
// router.patch("/:id",isAuthenticated,createUpload("avatars", "avatar", 1), validate(userSchema),checkOwnership, userController.updateUser);
router.patch(
  "/:id",
  isAuthenticated,
  createUpload("avatars", "avatar", 1), // d'abord Multer
  checkOwnership,
  userController.updateUser
);
router.delete("/:id", userController.deleteUser);

router.delete("/:id/soft", userController.softDeleteUser);
router.patch("/:id/restore", userController.restoreUser);

router.delete("/:id/avatar", isAuthenticated, checkOwnership, userController.deleteAvatar);
router.put("/:id/role", isAuthenticated, authorizeRoles("admin"), userController.changeRole);

export default router;


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *         - password
 *       properties:
 *         fullname:
 *           type: string
 *           description: User's fullname
 *           example: John Doe
 *         email:
 *           type: string
 *           description: User's email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           description: User's password
 *           example: password123
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: 2025-10-12T10:00:00.000Z
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Soft delete timestamp
 *           example: null
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get all non-deleted users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/deleted:
 *   get:
 *     summary: Get all soft-deleted users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of soft-deleted users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete a user permanently
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/{id}/soft:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User soft deleted
 *       404:
 *         description: User not found
 *
 * /users/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored
 *       404:
 *         description: User not found
 */