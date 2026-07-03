import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./schema";

// The D1 binding is resolved from the request context by the Cloudflare Vite
// plugin, so this module-scoped instance is safe in the Workers runtime.
export const db = drizzle(env.DB, { schema });

export { schema };
