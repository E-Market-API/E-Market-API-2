import Cart from "../models/Cart.js";
import { faker } from "@faker-js/faker";

/**
 * Creates one or more guest carts in the database.
 * Each cart has a unique sessionId and random items.
 * @param {number} count - Number of carts to create (default 1)
 * @param {Object} overrides - Optional overrides (items, etc.)
 * @returns {Promise<Cart[]>} - Array of created cart documents
 */
export const cartFactory = async (count = 1, overrides = {}) => {
  const carts = [];

  for (let i = 0; i < count; i++) {
    const cart = await Cart.create({
      userId: null, // always guest
      sessionId: overrides.sessionId || faker.string.uuid(),
      items: overrides.items || [
        {
          productId: overrides.productId || faker.database.mongodbObjectId(),
          quantity: faker.number.int({ min: 1, max: 5 }),
        },
      ],
      ...overrides,
    });

    carts.push(cart);
  }

  return carts;
};