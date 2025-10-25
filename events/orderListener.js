import { notificationEmitter } from "./notificationEmitter.js";
import Notification from "../models/Notification.js";

// Quand une nouvelle commande est créée
notificationEmitter.on("newOrder", async ({ orderId, buyerId, sellerId }) => {
  try {
    // Notification pour le vendeur
    const messageSeller = `Nouvelle commande reçue : ${orderId}`;
    await Notification.create({ userId: sellerId, message: messageSeller });

    // Notification pour l’acheteur
    const messageBuyer = `Commande passée avec succès : ${orderId}`;
    await Notification.create({ userId: buyerId, message: messageBuyer });

    console.log("Notifications créées pour la nouvelle commande !");
  } catch (error) {
    console.error("Erreur lors de la création des notifications de commande :", error);
  }
});

// Quand une commande est supprimée
notificationEmitter.on("orderDeleted", async ({ orderId, buyerId, sellerId, status }) => {
  try {
    // Message pour le vendeur
    const messageSeller = `Commande ${orderId} a été supprimée `;
    await Notification.create({ userId: sellerId, message: messageSeller });

    // Message pour l’acheteur
    const messageBuyer = `Votre commande ${orderId} a été supprimée : ${status}`;
    await Notification.create({ userId: buyerId, message: messageBuyer });

    console.log("Notifications créées pour la suppression de la commande !");
  } catch (error) {
    console.error("Erreur lors de la création des notifications de mise à jour :", error);
  }
});
