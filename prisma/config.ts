import { defineConfig } from "prisma/config";
import path from "path";

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  pg: {
    dataSourceUrl: process.env.DATABASE_URL || "",
  },
});
