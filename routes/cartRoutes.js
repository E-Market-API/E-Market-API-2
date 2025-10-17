import express from "express";
import * as CartController from "../controllers/cartController.js";
import validate from "../middlewares/validate.js";
import { cartSchema } from "../validations/cartSchema.js";

const router = express.Router();

router.get("/", CartController.getCart);
router.post("/", validate(cartSchema), CartController.addToCart);
router.put("/", validate(cartSchema), CartController.updateCartItemQuantity);
router.delete("/", CartController.removeCartItem);
router.delete("/clear", CartController.clearCart);

export default router;