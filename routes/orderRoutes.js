import express from "express";
import * as OrderController from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/auth.js"
// import validate from "../middlewares/validate.js";
// import { cartSchema } from "../validations/cartSchema.js";

const router = express.Router();

router.post("/", isAuthenticated, OrderController.createOrder);
router.patch("/:id/status", isAuthenticated, OrderController.updateOrderStatus);

export default router;