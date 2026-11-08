import { initDb, prisma } from "./postgres.js";

const HISTORY_KEY = "admin.dashboard-history";
const HISTORY_DAYS = 35;

export async function recordDashboardSnapshot(products) {
  const activeProducts = products.filter((product) => product.active);
  const snapshot = {
    date: new Date().toISOString().slice(0, 10),
    products: activeProducts.length,
    stockValue: products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0),
    averagePrice: products.length
      ? products.reduce((sum, product) => sum + Number(product.price || 0), 0) / products.length
      : 0,
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
    outOfStock: products.filter((product) => product.stock <= 0).length,
  };

  if (!prisma) return [snapshot];

  await initDb();
  const setting = await prisma.setting.findUnique({ where: { key: HISTORY_KEY } });
  let history = [];
  if (setting) {
    try {
      const parsed = JSON.parse(setting.value);
      if (!Array.isArray(parsed)) throw new TypeError("L’historique du tableau de bord doit être un tableau.");
      history = parsed.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry?.date));
    } catch (error) {
      console.error("Historique du tableau de bord invalide :", error);
      throw new Error("Impossible de lire l’historique du tableau de bord.");
    }
  }

  const sameDayIndex = history.findIndex((entry) => entry.date === snapshot.date);
  if (sameDayIndex >= 0) history[sameDayIndex] = snapshot;
  else history.push(snapshot);
  history = history
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-HISTORY_DAYS);

  await prisma.setting.upsert({
    where: { key: HISTORY_KEY },
    create: { key: HISTORY_KEY, value: JSON.stringify(history) },
    update: { value: JSON.stringify(history) },
  });

  return history;
}
