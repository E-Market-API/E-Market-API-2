import mongoose from "mongoose";
import { userFactory } from "../factories/userFactory.js";
import dotenv from "dotenv";

dotenv.config();


const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.DB_URI);

    // Clear DB
    await mongoose.connection.dropDatabase();
    console.log("Database cleared.");

    // Create 5 random users
    const randomUsers = await userFactory(5);

    const [adminUser] = await userFactory(1, {
      fullname: "Admin User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });
    
    await mongoose.connection.close();
    console.log("Database seeding completed.");
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.connection.close();
  }
};

// Run the seeder
seedDB();