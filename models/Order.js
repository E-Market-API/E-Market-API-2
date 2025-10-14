import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDeletePlugin";

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }, // snapshot of product price
            },
        ],
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
        deletedAt: {
            type: Date,
            default: null
        },
    },
    { timestamps: true }
);

orderSchema.plugin(softDeletePlugin);

export default mongoose.model("Order", orderSchema);