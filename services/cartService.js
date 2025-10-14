import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

class CartService {
    // Get cart by userId or sessionId
    static async getCart(identifier) {
        return await Cart.findOne(identifier);
    }

    // Add item to cart
    static async addItem(identifier, productId, quantity) {
                
        const product = await Product.findById(productId);
        quantity = Number(quantity);

        if (!product) throw new Error("Product not found");

        let cart = await Cart.findOne(identifier);

        if (!cart) {
            cart = await Cart.create({
                ...identifier,
                items: [{ productId, quantity }],
            });
            return { cart, message: "Cart created and item added" };
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            await cart.save();
            return { cart, message: "Product quantity updated in cart" };
        } else {
            cart.items.push({ productId, quantity });
            await cart.save();
            return { cart, message: "Product added to cart" };
        }
    }

    // Update cart item quantity
    static async updateItemQuantity(identifier, productId, quantity) {

        const cart = await Cart.findOne(identifier);
        if (!cart) throw new Error("Cart not found");

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) throw new Error("Product not in cart");

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return { cart, message: "Cart item quantity updated" };
    }

    // Remove cart item
    static async removeItem(identifier, productId) {
        const cart = await Cart.findOne(identifier);
        if (!cart) throw new Error("Cart not found");

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) throw new Error("Product not in cart");

        // Remove item
        cart.items.splice(itemIndex, 1);
        await cart.save();

        return { cart, message: "Product removed from cart" };
    }

    // Clear cart
    static async clearCart(identifier) {
        const cart = await Cart.findOne(identifier);
        if (!cart) throw new Error("Cart not found");

        cart.items = []; // remove all items
        await cart.save();

        return { cart, message: "Cart cleared successfully" };
    }
}

export default CartService;