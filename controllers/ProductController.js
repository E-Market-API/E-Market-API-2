import Product from "../models/Product.js";

export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated", Product: updatedProduct });
  } catch (error) {
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
    const Products = await Product.find()
      .notDeleted()
      .populate("categories"); // <-- query helper
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
