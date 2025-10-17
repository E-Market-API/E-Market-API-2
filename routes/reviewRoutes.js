import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import validate from "../middlewares/validate.js";
import { createReviewSchema, updateReviewSchema, moderateReviewSchema } from "../validations/reviewValidator.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/roles.js";
import { reviewRateLimit } from "../middlewares/rateLimiter.js";
import  {checkReviewOwnership} from '../middlewares/ownershipMiddleware.js';
const router = express.Router();

// Routes publiques
router.get("/product/:productId", reviewController.getProductReviews);

// Routes private
router.use(isAuthenticated);

router.post("/", validate(createReviewSchema), reviewController.createReview);
router.get("/me", reviewController.getUserReviews);
router.put("/:id", checkReviewOwnership, validate(updateReviewSchema), reviewController.updateReview);
router.delete("/:id", checkReviewOwnership, reviewController.deleteReview);

// Routes for admin
router.patch("/:id/moderate", authorizeRoles("admin"), validate(moderateReviewSchema), reviewController.moderateReview);

export default router;
