import mongoose from "mongoose";
import { userFactory } from "../factories/userFactory.js";
import dotenv from "dotenv";
import { categoryFactory } from "../factories/categoryFactory.js";
import { cartFactory } from "../factories/cartFactory.js";
import { orderFactory } from "../factories/orderFactory.js";
import productFactory from "../factories/productFactory.js";

dotenv.config();


const seedDB = async () => {
  
  try {
    // Connect to DB
    await mongoose.connect(process.env.DB_URI);

    // Clear DB
    await mongoose.connection.dropDatabase();
    console.log("Database cleared.");

    // Creat an admin
    await userFactory(1, {
      fullname: "Admin User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });

    // seed sellers for creating products
    await userFactory(1, {
      fullname: "Seller User",
      email: "seller@test.com",
      password: "seller123",
      role: "seller",
    });
    await userFactory(1, {
      fullname: "Seller User 2",
      email: "seller2@test.com",
      password: "seller123",
      role: "seller",
    });
    await userFactory(1, {
      fullname: "Seller User 3",
      email: "seller3@test.com",
      password: "seller123",
      role: "seller",
    });

    await userFactory(5); // seed users
    await categoryFactory(6); // seed categories
    await productFactory(10); // seed products
    await cartFactory(3); // seed carts
    await orderFactory(3); // seed orders

    await mongoose.connection.close();
    console.log("Database seeding completed.");
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.connection.close();
  }
};

// Run the seeder
seedDB();