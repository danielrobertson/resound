import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` only needs the schema + dialect to emit SQL; the
// migrations are applied to D1 via `wrangler d1 migrations apply`.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
