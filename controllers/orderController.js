import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import StockService from "../services/StockService.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Check stock for each product
    for (const item of cart.items) {
      await StockService.checkStock(item.productId._id, item.quantity);
    }

    // Decrease stock for each product
    for (const item of cart.items) {
      await StockService.decreaseStock(item.productId._id, item.quantity);
    }

    // Create the order
    const order = await Order.create(
      [
        {
          userId,
          items: cart.items.map((i) => ({
            productId: i.productId._id,
            quantity: i.quantity,
            price: i.productId.price,
          })),
          totalPrice: cart.items.reduce(
            (sum, i) => sum + i.productId.price * i.quantity,
            0
          ),
          status: "pending",
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const statusPriority = {
      pending: 1,
      cancelled: 2,
      shipped: 3,
      delivered: 4,
    };

    // Only allow status updates if newStatus is same or higher priority
    if (statusPriority[newStatus] < statusPriority[order.status]) {
      return res.status(400).json({
        message: `Cannot revert order status from ${order.status} to ${newStatus}`,
      });
    }

    order.status = newStatus;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};