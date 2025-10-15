import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import review from "../models/Review.js";

export const createReview = async (req,res,next) => {
    try {
        const {product, rating, comment} =req.body;
        const userId = req.user.id;

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({error: "Product not found"});
        }
        // check if user has by this product before rating

        // check if there is no review before
        const existingReview = await Review.findOne({user: userId, product});
        if (existingReview) {
            return  res.status(400).json({error: "You have already reviewed this product"});
        }
         const review = new Review({
             user: userId,
             product,
             rating,
             comment
         });
        await review.save();

        const {averageRating, totalReviews} = await Review.calculateAverageRating(product);
        await Product.findByIdAndUpdate(product, {
            averageRating,
            totalReviews
        });
        res.status(201).json({message: "Review created successfully", review});
    } catch (e) {
        next(e);
    }
}
export const getProductReviews = async (req,res,next) => {
    try {
        const {productId} = req.params;
        const {page=1, limit = 10} = req.query;
        const isAdmin = req.user?.role === "admin";

        // filtre pour le status , juste pour les users
        const filter = {product: productId};
        if (!isAdmin) {
            filter.status = "approved";
        }
        const reviews = await Review.find(filter)
            .populate("user","fullname avatar")
            .sort({createdAt: -1})
            .limit(limit * 1)
            .skip((page -1) * limit);
        
        const total = await  Review.countDocuments(filter);
        res.status(200).json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        next(e);
    }
}
// get all user auth reviews
export const getUserReviews = async (req,res,next) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.find({user: userId})
            .populate("product", "title images price")
            .sort({createdAt: -1});
        res.status(200).json({reviews});
    } catch (e) {
        next(e);
    }
}
export const updateReview = async (req,res,next) => {
    try {
        const {id} = req.params;
        const {rating, comment} = req.body;
        const userId = req.user.id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({error: "Review not found"});
        }
        if (review.user.toString() !== userId) {
            return res.status(404).json({error: "You can only update your own reviews"});
        }
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.status = "pending";
        await  review.save();
        const {averageRating, totalReviews} = await  Review.calculateAverageRating(review.product);
        await Product.findByIdAndUpdate(review.product, {
            averageRating,
            totalReviews
        });
        res.status(200).json({message: "Review updated successfully"});
    } catch (e) {
        next(e);
    }
}
export const deleteReview = async (req,res,next) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role = "admin";

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({error: "Review not found"});
        }
        if (review.user.toString() !== userId && !isAdmin) {
            return res.status(403).json({error: "Access denied"});
        }
        const productId = review.product;
        await Review.findByIdAndDelete(id);

        // recalculer la note moyenne du produit
        const {averageRating, totalReviews} = await Review.calculateAverageRating(productId);
        await Product.findByIdAndUpdate(review.product, {
            averageRating,
            totalReviews
        });
        res.status(204).send();
    } catch (e) {
        next(e);
    }
}
export const moderateReview = async (req,res,next) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({error: "Invalid status. Must be 'approved' or 'rejected'"});
        }
        const review = await Review.findByIdAndUpdate(
            id,
            {status},
            {new: true}
        );
        if (!review) {
            return res.status(404).json({error: "Review not found"});
        }
        // recalculer la note moyenne du produit
        const {averageRating, totalReviews} = await Review.calculateAverageRating(productId);
        await Product.findByIdAndUpdate(review.product, {
            averageRating,
            totalReviews
        });
        res.status(200).json({message: "Review moderated successfully", review});

    } catch (e) {
        next(e);
    }
}