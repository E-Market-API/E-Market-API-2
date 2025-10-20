import mongoose from "mongoose";
import dotenv from "dotenv";
import Cart from "../models/Cart";

dotenv.config();

const uri = process.env.DB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    // Ensure Cart indexes are created
    try {
      await Cart.init();
      console.log("Cart indexes ensured");
    } catch (err) {
      console.error("Error ensuring Cart indexes:", err);
    }
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // stop server if DB connection fails
  }
};

export default connectDB;