import express from "express";
import * as couponController from "../controllers/couponController.js";
import validate from "../middlewares/validate.js";
import { couponSchema } from "../validations/couponSchema.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/roles.js";
import {couponRateLimit} from "../middlewares/rateLimiter.js";

const router = express.Router();

// Toutes les routes doivent etre authentifier
router.use(isAuthenticated);

router.post("/", authorizeRoles("admin", "seller"), validate(couponSchema), couponController.createCoupon);
router.get("/", authorizeRoles("admin", "seller"), couponController.getAllCoupons);
router.get("/:id", authorizeRoles("admin", "seller"), couponController.getCouponById);
router.put("/:id", authorizeRoles("admin", "seller"), validate(couponSchema), couponController.updateCoupon);
router.delete("/:id", authorizeRoles("admin", "seller"), couponController.deleteCoupon);

// Route de validation pour auth users
router.post("/validate", couponRateLimit, couponController.validateCoupon);

export default router;
