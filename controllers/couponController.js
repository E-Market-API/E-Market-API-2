import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res, next) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "seller") {
            return res.status(403).json({error: "Access denied: admin and seller only"});
        }
        const coupon = new Coupon({
            ...req.body,
            createdBy: req.user.id
        });
        await coupon.save();
        res.status(201).json({message: "Coupon created successfully", coupon});
    } catch (e) {
        next(e);
    }
};
export const getAllCoupons = async (req,res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page -1) * limit;

        let filter = {};
        if (req.user.role === "seller") {
            filter.createdBy = req.user.id;
        }
        const coupons = await Coupon.find(filter)
            .notDeleted()
            .populate("createdBy","fullname email")
            .skip(skip)
            .limit(limit);
        const total = await Coupon.countDocuments(filter);
        res.status(200).json({
            coupons,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
    next(e);
    }
}
export  const getCouponById = async (req,res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id).populate("createdBy", "fullname email");
        if (!coupon) {
            return res.status(404).json({error: "Coupon not found"});
        }
        if (req.user.role !== "admin" && coupon.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({error: "Access denied"});
        }
        res.status(200).json(coupon);
    } catch (e) {
        next(e);
    }
}
export  const updateCoupon = async (req,res,next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({error: "Coupon not found"});
        }
        if (req.user.role !== "admin" && coupon.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({error: "Access denied"});
        }
        const updatedCoupon = await  Coupon.findByIdAndUpdate(
            req.params.id, req.body, {new: true, runValidators: true}
        );
        res.status(200).json({message: "Coupon updated", coupon: updatedCoupon});
    } catch (e) {
        next(e);
    }
};
export  const deleteCoupon  = async (req,res,next) => {
    try {
        const coupon = await  Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({error: "Coupon not found"});
        }
        if (req.user.role !== "admin" && coupon.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({error: "Access denied"});
        }
        await  coupon.softDelete();
        res.status(204).send();
    } catch (e) {
        next(e);
    }
};
export const validateCoupon = async (req, res, next) => {
    try {
        const { code, purchaseAmount, userId } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" }).notDeleted();

        if (!coupon) {
            logFailedValidation(req, 'Invalid coupon code');
            return res.status(400).json({ error: "Invalid coupon code" });
        }

        const now = new Date();
        if (now < coupon.startDate || now > coupon.expirationDate) {
            logFailedValidation(req, 'Coupon expired or not active');
            return res.status(400).json({ error: "Coupon has expired or not yet active" });
        }

        if (purchaseAmount < coupon.minimumPurchase) {
            logFailedValidation(req, 'Minimum purchase not met');
            return res.status(400).json({
                error: `Minimum purchase amount is ${coupon.minimumPurchase}`
            });
        }


        if (coupon.maxUsage && coupon.usedBy.length >= coupon.maxUsage) {
            logFailedValidation(req, 'Usage limit reached');
            return res.status(400).json({ error: "Coupon usage limit reached" });
        }

        const userUsage = coupon.usedBy.filter(usage =>
            usage.user.toString() === userId
        ).reduce((total, usage) => total + usage.usageCount, 0);

        if (userUsage >= coupon.maxUsagePerUser) {
            logFailedValidation(req, 'User usage limit reached');
            return res.status(400).json({ error: "User usage limit reached" });
        }

        let discountAmount = 0;
        if (coupon.type === "percentage") {
            discountAmount = (purchaseAmount * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        res.status(200).json({
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discountAmount
            }
        });
    } catch (error) {
        logFailedValidation(req, 'Server error');
        next(error);
    }
};