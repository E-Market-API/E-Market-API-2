// events/notificationListener.js
import { notificationEmitter } from "./notificationEmitter.js";
import Notification from "../models/Notification.js";

// Quand un vendeur crée un produit
notificationEmitter.on("newProduct", async ({ sellerId, productName, usersToNotify }) => {
  try {
    const message = `Nouveau produit publié : ${productName}`;
    
    // Créer une notification pour chaque utilisateur concerné
    const notifications = usersToNotify.map(userId => ({
      userId,
      message
    }));

    await Notification.insertMany(notifications);
    console.log("Notifications créées pour le nouveau produit !");
  } catch (error) {
    console.error("Erreur lors de la création des notifications :", error);
  }
});
