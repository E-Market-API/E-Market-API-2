import Category from "../models/Category.js";
import { faker } from "@faker-js/faker";

/**
 * Creates one or more categories in the database.
 * @param {number} count - Number of categories to create (default 1)
 * @param {Object} overrides - Optional overrides applied to all categories
 * @returns {Promise<Category[]>} - Array of created category documents
 */
export const categoryFactory = async (count = 1, overrides = {}) => {
    const categories = [];

    for (let i = 0; i < count; i++) {
        const category = await Category.create({
            name: overrides.name || faker.commerce.department(), // random category name
            ...overrides,
        });

        categories.push(category);
    }

    return categories;
};