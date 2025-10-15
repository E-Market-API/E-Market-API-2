import express from "express";
import * as OrderController from "../controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js"
// import validate from "../middlewares/validate.js";
// import { cartSchema } from "../validations/cartSchema.js";

const router = express.Router();


router.get("/", isAuthenticated, isAdmin, OrderController.getOrders);
router.get("/deleted", isAuthenticated, isAdmin, OrderController.getDeletedOrders);

router.post("/", isAuthenticated, OrderController.createOrder);
router.patch("/:id/status", isAuthenticated, OrderController.updateOrderStatus);
router.delete("/:id", OrderController.deleteOrder);

router.delete("/:id/soft", isAuthenticated, isAdmin, OrderController.softDeleteOrder);
router.patch("/:id/restore", isAuthenticated, isAdmin, OrderController.restoreOrder);

export default router;