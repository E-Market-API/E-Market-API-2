import express from "express";
import * as productController from "../controllers/ProductController.js";
import validate from "../middlewares/validate.js";
import { productSchema } from "../validations/productSchema.js";
import { isAdmin, isAuthenticated, isSeller } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", validate(productSchema), isAuthenticated, isSeller,productController.createProduct);
router.get("/", productController.getProducts);
router.get("/published", productController.getPublishedProducts);
router.get("/deleted", productController.getDeletedProducts);
router.get("/search", productController.searchProducts);

router.get("/:id", productController.getProductById);
router.patch("/:id", validate(productSchema), isAuthenticated, isSeller, productController.updateProduct);
router.delete("/:id", isAuthenticated, isAdmin, productController.deleteProduct);

router.delete("/:id/soft", isAuthenticated, isSeller, productController.softDeleteProduct);
router.patch("/:id/restore", isAuthenticated, isSeller, productController.restoreProduct);

export default router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         title:
 *           type: string
 *           description: The product title
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           description: The price of the product
 *           minimum: 0
 *         stock:
 *           type: number
 *           description: The number of items in stock
 *           minimum: 0
 *         categories:
 *           type: array
 *           description: IDs of categories this product belongs to
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             description: URL or path to product image
 *         createdAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *       example:
 *         title: "Wireless Mouse"
 *         description: "Ergonomic wireless mouse with USB receiver"
 *         price: 29.99
 *         stock: 150
 *         categories: ["60d21b4567d0d8992e610c80"]
 *         images: ["uploads/mouse1.jpg", "uploads/mouse2.jpg"]
 *         createdAt: "2025-10-12T07:14:46.501Z"
 *         deletedAt: null
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products/deleted:
 *   get:
 *     summary: Get all soft-deleted products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of deleted products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}/soft:
 *   delete:
 *     summary: Soft delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product soft deleted successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product restored successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Permanently delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product permanently deleted
 *       404:
 *         description: Product not found
 */