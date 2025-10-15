import express from "express";
import * as couponController from "../controllers/couponController.js";
import validate from "../middlewares/validate.js";
import { couponSchema } from "../validations/couponSchema.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {couponRateLimit} from "../middlewares/rateLimiter.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated);

// Routes CRUD pour seller/admin (middleware seller/admin)
router.post("/", validate(couponSchema), couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", validate(couponSchema), couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

// Route de validation pour utilisateurs authentifiés
router.post("/validate", couponRateLimit, couponController.validateCoupon);

export default router;
