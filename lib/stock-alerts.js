export const LOW_STOCK_THRESHOLD = 5;

export function evaluateStockStatus(stock) {
  const value = Number(stock);
  if (!Number.isFinite(value)) return null;
  if (value <= 0) return "out";
  if (value <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

export function notifyStockAlert() {
  // WhatsApp désactivé : plus d'envoi.
}

export function notifyStockAlertAsync() {
  // WhatsApp désactivé : plus d'envoi.
}

export function forgetStockAlert(id) {
  // WhatsApp désactivé : plus d'envoi.
}

