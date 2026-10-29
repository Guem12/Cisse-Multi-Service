import pkg from "pg";
const { Pool } = pkg;

// Pool PostgreSQL pour serverless (Netlify/Vercel)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.startsWith("postgres://")
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

// Exécuter une requête
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`Executed query ${duration}ms: ${text.substring(0, 50)}...`);
  return res;
}

// Exécuter une requête et retourner la première ligne
export async function queryOne(text, params) {
  const res = await query(text, params);
  return res.rows[0] || null;
}

// Exécuter une commande (INSERT, UPDATE, DELETE)
export async function queryExec(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// Fermer le pool (utiliser en fin de vie de l'application)
export async function closePool() {
  await pool.end();
}

// Vérifier la connexion
export async function testConnection() {
  try {
    const res = await query("SELECT 1 as ok");
    return { success: true, result: res.rows[0] };
  } catch (err) {
    console.error("Erreur connexion PostgreSQL:", err);
    return { success: false, error: err.message };
  }
}
