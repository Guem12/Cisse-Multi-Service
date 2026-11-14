import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "cisse-media": { access: "public_read" },
  },
});
