import { defineConfig } from "@neon/config/v1";
import { setupRealtime } from "@neon/config/v1/realtime";

export default defineConfig({
  auth: true,
  branch: (b) => ({ parent: b.isDefault ? undefined : "main", ttl: b.isDefault ? undefined : "7d" }),
  realtime: true,
});
// Neon Realtime configuration
// Rend les queries SQL live pour les UI réactives
// Voir : https://neon.tech/docs/realtime
// Helper généré par : npx neon setup realtime
