import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../config/env";
import * as schemas from "./schemas";

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql, schema: schemas });

export { db };
