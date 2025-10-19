import mongoose from "mongoose";
import { userFactory } from "../factories/userFactory.js";
import dotenv from "dotenv";
import { categoryFactory } from "../factories/categoryFactory.js";
import { cartFactory } from "../factories/cartFactory.js";

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

    await userFactory(5); // seed users
    await categoryFactory(6); // seed categories
    await cartFactory(3); // seedcarts

    await mongoose.connection.close();
    console.log("Database seeding completed.");
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.connection.close();
  }
};

// Run the seeder
seedDB();