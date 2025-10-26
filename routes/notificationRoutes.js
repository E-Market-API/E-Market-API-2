// routes/notificationRoutes.js
import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);
router.patch("/:id/read", isAuthenticated, markAsRead);

export default router;
