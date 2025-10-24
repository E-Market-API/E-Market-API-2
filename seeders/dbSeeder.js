import mongoose from "mongoose";
import { userFactory } from "../factories/userFactory.js";
import dotenv from "dotenv";
import { categoryFactory } from "../factories/categoryFactory.js";
import { cartFactory } from "../factories/cartFactory.js";
import { orderFactory } from "../factories/orderFactory.js";

dotenv.config();


const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.DB_URI);

    // Clear DB
    // await mongoose.connection.dropDatabase();
    // console.log("Database cleared.");

    // Creat an admin
    await userFactory(1, {
      fullname: "Admin User",
      email: "admin@test.com",
      password: "password",
      role: "admin",
    });

    // Creat a seller
    await userFactory(1, {
      fullname: "seller User",
      email: "seller@test.com",
      password: "password",
      role: "seller",
    });

    // Creat a user
    await userFactory(1, {
      fullname: " User",
      email: "user@test.com",
      password: "password",
      role: "user",
    });

    await userFactory(5); // seed users
    await categoryFactory(6); // seed categories
    await cartFactory(1); // seed carts
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