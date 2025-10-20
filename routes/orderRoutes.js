import express from "express";
import * as OrderController from "../controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/roles.js";
import { ro } from "@faker-js/faker";
// import validate from "../middlewares/validate.js";
// import { cartSchema } from "../validations/cartSchema.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", isAdmin, OrderController.getOrders);
router.get("/deleted", isAdmin, OrderController.getDeletedOrders);

router.post("/",authorizeRoles("user"), OrderController.createOrder);
router.patch("/:id/status",authorizeRoles("user"), OrderController.updateOrderStatus);
router.delete("/:id",authorizeRoles("user","admin"), OrderController.deleteOrder);

router.delete("/:id/soft", isAdmin, OrderController.softDeleteOrder);
router.patch("/:id/restore", isAdmin, OrderController.restoreOrder);

export default router;