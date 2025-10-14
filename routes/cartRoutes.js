import express from "express";
import * as CartController from "../controllers/cartController.js";
import validate from "../middlewares/validate.js";
import { cartSchema } from "../validations/cartSchema.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, CartController.getCart);
router.post("/", validate(cartSchema), isAuthenticated, CartController.addToCart);
router.put("/", validate(cartSchema), isAuthenticated, CartController.updateCartItemQuantity);
router.delete("/", isAuthenticated, CartController.removeCartItem);
router.delete("/clear", isAuthenticated, CartController.clearCart);

export default router;