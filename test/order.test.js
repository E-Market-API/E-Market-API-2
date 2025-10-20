import * as chai from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import { userFactory } from "../factories/userFactory.js";
import { categoryFactory } from "../factories/categoryFactory.js";
import { cartFactory } from "../factories/cartFactory.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const { expect } = chai;

describe("Order API", function () {
  this.timeout(10000); // increase timeout for DB ops

  let testConnection;
  let token;
  let user, cart;

  before(async () => {
    // Create test DB connection
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }

    // Connect to test DB
    await mongoose.connect(process.env.MONGO_URI_TEST);
    testConnection = mongoose.connection;
    // Seed a user
    [user] = await userFactory(1, { email: "testuser@test.com", password: "123456" });

    // Seed a cart for the user
    [cart] = await cartFactory(1, { userId: user._id });

    // Log in user to get token
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@test.com", password: "123456" });

    token = res.body.token;
  });


  after(async () => {
    if (testConnection) {
      await testConnection.dropDatabase();
      await testConnection.close();
    }
  });

  describe("POST /api/orders", () => {
    it("should create a new order successfully", async () => {
      try {
        const cart = await Cart.findOne({ userId: user._id });

        const res = await request(app)
          .post("/api/orders")
          .set("Authorization", `Bearer ${token}`)
          .send({
            coupons: [], // optional
          });

        // Log the full response body in case of failure
        if (res.status !== 201) {
          console.error("Order creation failed:", res.body);
        }

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message", "Order created successfully");
        expect(res.body).to.have.property("order");
      } catch (err) {
        console.error("Test error:", err);
        throw err;
      }
    });
  });

});
