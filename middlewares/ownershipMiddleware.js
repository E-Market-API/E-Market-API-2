// middlewares/ownershipMiddleware.js
import User from "../models/User.js";

export const checkOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }
    const userIdFromToken = req.user.id; // ID contenu dans le JWT
    const userIdFromParams = req.params.id; // ID dans l'URL

    // Vérifie si l'utilisateur existe et n'est pas supprimé
    const targetUser = await User.findById(userIdFromParams);
    if (!targetUser || targetUser.deletedAt) {
      return res.status(404).json({ message: "Utilisateur introuvable ou supprimé" });
    }

    // Vérifie la propriété de l'utilisateur
    if (userIdFromToken === userIdFromParams ) {
      return next(); // autorisé
    }
    return res.status(403).json({
      message: "Accès refusé : vous ne pouvez pas accéder aux données d’un autre utilisateur.",
    });
  } catch (error) {
    console.error("Erreur ownershipMiddleware:", error);
    return res.status(500).json({ message: "Erreur serveur dans ownershipMiddleware" });
  }
};
