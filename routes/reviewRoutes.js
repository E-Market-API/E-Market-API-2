import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import validate from "../middlewares/validate.js";
import { createReviewSchema, updateReviewSchema, moderateReviewSchema } from "../validations/reviewValidator.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/roles.js";
import { reviewRateLimit } from "../middlewares/rateLimiter.js";
import Review from "../models/Review.js";

const router = express.Router();

// Middleware pour vérifier la propriété d'un avis
const checkReviewOwnership = async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === "admin";

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.user.toString() !== userId && !isAdmin) {
            return res.status(403).json({ error: "Access denied" });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Routes publiques
router.get("/product/:productId", reviewController.getProductReviews);

// Routes protégées
router.use(isAuthenticated);

router.post("/", reviewRateLimit, validate(createReviewSchema), reviewController.createReview);
router.get("/me", reviewController.getUserReviews);
router.put("/:id", checkReviewOwnership, validate(updateReviewSchema), reviewController.updateReview);
router.delete("/:id", checkReviewOwnership, reviewController.deleteReview);

// Routes admin uniquement
router.patch("/:id/moderate", authorizeRoles("admin"), validate(moderateReviewSchema), reviewController.moderateReview);

export default router;
