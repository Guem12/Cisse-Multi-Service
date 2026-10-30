import { defineConfig } from "@neon/config/v1";
export default defineConfig({
  auth: true,
  branch: (b) => ({ parent: b.isDefault ? undefined : "main", ttl: b.isDefault ? undefined : "7d" }),
});
