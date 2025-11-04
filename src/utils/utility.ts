/**
 * @type {Readonly<Record<string, string>>}
 * Object to map order status strings (received from the backend) to Flat UI colors using Hex Codes.
 * Excludes typical bright green and red.
 */
export const STATUS_COLOR_MAP_HEX = {
  // --- Initial/Processing States (Blue/Navy/Cyan) ---
  not_shipped: "#3498db", // Peter River (Light Blue)
  pending: "#2980b9", // Belize Hole (Medium Blue)
  in_transit: "#2ecc71", // Emerald (Vibrant Green for movement, but not a "success" color)
  in_review: "#1abc9c", // Turquoise (Cyan)

  // --- Intermediate/Partial States (Orange/Yellow) ---
  partial_delivered: "#f39c12", // Orange
  partial_delivered_approval_pending: "#f1c40f", // Sunflower (Yellow)

  // --- Approval Pending States (Purple/Wisteria) ---
  delivered_approval_pending: "#9b59b6", // Wisteria (Purple)
  cancelled_approval_pending: "#8e44ad", // Amethyst (Darker Purple)
  unknown_approval_pending: "#bdc3c7", // Silver (Light Grey)

  // --- Final/Terminal States (Deep Green/Dark Red/Grey) ---
  delivered: "#27ae60", // Neptun (Deep Blue-Green, avoiding bright success green)
  cancelled: "#c0392b", // Pomegranate (Deep, dark red, avoiding bright alert red)
  hold: "#7f8c8d", // Asbestos (Dark Grey)
  unknown: "#34495e", // Wet Asphalt (Dark Navy/Grey)
};
