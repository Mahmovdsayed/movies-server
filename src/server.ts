import { env } from "./config/env";
import app from "./index";

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Movies server running on port ${env.PORT} [${env.NODE_ENV}]`);
