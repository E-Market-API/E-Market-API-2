// jobs/lowStockNotifier.js
import cron from "node-cron";
import Cart from "../models/Cart.js";
import Notification from "../models/Notification.js"; // 🔥 N'oublie pas d'importer
import Product from "../models/Product.js";

// Cron job: vérifie chaque minute les produits en panier avec stock ≤ 5
cron.schedule("* * * * *", async () => {
  try {
    console.log("Job lowStockNotification démarré...");

    // Récupérer tous les paniers avec uniquement les champs nécessaires
    const carts = await Cart.find({}, "items userId").populate("items.productId", "title stock");

    for (const cart of carts) {
      const notificationPromises = cart.items.map(async (item) => {
        const product = item.productId;
        if (!product) return;

        // Si stock critique et pas encore notifié
        if (product.stock <= 5 && !item.lowStockNotified) {
          const message = `Attention ! Le produit "${product.title}" dans votre panier est presque épuisé. Stock restant : ${product.stock}`;
          await Notification.create({ userId: cart.userId, message });
          item.lowStockNotified = true;
        }

        // Si stock remonte >5, réinitialiser la notification
        if (product.stock > 5 && item.lowStockNotified) {
          item.lowStockNotified = false;
        }
      });

      // Exécuter toutes les notifications en parallèle pour ce panier
      await Promise.all(notificationPromises);

      // Sauvegarder le panier
      await cart.save();
    }

    console.log("Job lowStockNotification exécuté avec succès !");
  } catch (err) {
    console.error("Erreur job lowStockNotification :", err);
  }
});
