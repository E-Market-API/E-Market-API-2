import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import { notificationEmitter } from "../events/notificationEmitter.js";
import User from "../models/User.js";

export const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.user && req.user.id) {
      data.seller_id = req.user.id;
    }

    if (req.files) {
      if (req.files.primaryImage && req.files.primaryImage[0]) {
        data.primaryImage = `/uploads/products/${req.files.primaryImage[0].filename}`;
      }
      if (req.files.secondaryImages) {
        data.secondaryImages = req.files.secondaryImages.map(
          (f) => `/uploads/products/${f.filename}`
        );
      }
    }
    const product = new Product(data);
    await product.save();

    const users = await User.find({ role: "user" }, "_id");
    console.log("Users to notify:", users);
    const usersToNotify = users.map(u => u._id);

    notificationEmitter.emit("newProduct", {
      sellerId: req.user.id,
      productName: product.title,
      usersToNotify
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    if (req.files) {
      const allFiles = [
        ...(req.files.primaryImage || []),
        ...(req.files.secondaryImages || []),
      ];
      allFiles.forEach((f) => {
        const p = path.join("uploads", "products", f.filename);
        fs.existsSync(p) && fs.unlinkSync(p);
      });
    }
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const product = await Product.findById(req.params.id);

    if (!product) {
      // cleanup uploaded files if any
      if (req.files) {
        const allFiles = [
          ...(req.files.primaryImage || []),
          ...(req.files.secondaryImages || []),
        ];
        allFiles.forEach((f) => {
          const p = path.join("uploads", "products", f.filename);
          fs.existsSync(p) && fs.unlinkSync(p);
        });
      }
      return res.status(404).json({ error: "Product not found" });
    }

    if (req.files) {
      if (req.files.primaryImage && req.files.primaryImage[0]) {
        updates.primaryImage = `/uploads/products/${req.files.primaryImage[0].filename}`;
      }
      if (req.files.secondaryImages) {
        updates.secondaryImages = req.files.secondaryImages.map(
          (f) => `/uploads/products/${f.filename}`
        );
      }
    }

    //  remove the previous images if new ones are uploaded
    const previousPrimaryImages = product.primaryImage;
    const previousSecondaryImages = product.secondaryImages || [];

    if (updates.primaryImage && previousPrimaryImages) {
      const p = path.join(
        "uploads",
        "products",
        path.basename(previousPrimaryImages)
      );
      fs.existsSync(p) && fs.unlinkSync(p);
    }
    if (updates.secondaryImages && previousSecondaryImages.length > 0) {
      previousSecondaryImages.forEach((imgPath) => {
        const p = path.join("uploads", "products", path.basename(imgPath));
        fs.existsSync(p) && fs.unlinkSync(p);
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated", Product: updatedProduct });
  } catch (error) {
    if (req.files) {
      const allFiles = [
        ...(req.files.primaryImage || []),
        ...(req.files.secondaryImages || []),
      ];
      allFiles.forEach((f) => {
        const p = path.join("uploads", "products", f.filename);
        fs.existsSync(p) && fs.unlinkSync(p);
      });
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    // Find the Product by ID and delete
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const Products = await Product.find().notDeleted().populate("categories"); // <-- query helper
    res.status(200).json({ Products });
  } catch (error) {
    next(error);
  }
};

export const getPublishedProducts = async (req, res, next) => {
  try {
    const Products = await Product.find()
      .notDeleted()
      .isPublished()
      .populate("categories");
    res.status(200).json({ Products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Soft delete
export const softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.softDelete();
    res.status(200).json({ message: "Product soft deleted" });
  } catch (error) {
    next(error);
  }
};

// Restore
export const restoreProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.restore(); // <-- helper
    res.status(200).json({ message: "Product restored" });
  } catch (error) {
    next(error);
  }
};

// Get all soft-deleted products
export const getDeletedProducts = async (req, res, next) => {
  try {
    const products = await Product.find().deleted();
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

// search function
export const searchProducts = async (req, res) => {
  try {
    const { title, categories, minPrice, maxPrice } = req.query;
    const filter = {};

    // Filter by title (case-insensitive)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // Filter by one or more categories
    if (categories) {
      const categoryArray = categories.split(",");
      filter.categories = { $in: categoryArray };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Server error while searching products" });
  }
};

export const getProductsBySeller = async (req, res, next) => {
  try {
    const sellerId = req.params.sellerId;
    const products = await Product.find({ seller_id: sellerId }).notDeleted().populate("categories");
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

export const publishProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.published = true;
    await product.save();
    res.status(200).json({ message: "Product published" });
  } catch (error) {
    next(error);
  }
};
