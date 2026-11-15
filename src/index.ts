import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { env } from "./config/env";
import { auth } from "./infrastructure/auth/auth";
import type { AppEnv } from "./types/app";
import movieRoutes from "./modules/movies/movies.routes";
import redis from "./helpers/redis";

const app = new Hono<AppEnv>();
app.use("*", requestId());

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const reqId = c.get("requestId") ?? "-";
  console.log(
    `[${reqId}] ${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`,
  );
});

const defaultDevOrigins = [
  "http://localhost:8081",
  "http://localhost:3000",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:3000",
];

const configuredOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : [];

const allowedOrigins = [
  ...new Set([...configuredOrigins, ...defaultDevOrigins]),
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (allowedOrigins.includes(origin)) return origin;
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        )
      ) {
        return origin;
      }
      if (/^https?:\/\/.*\.exp\.direct(:\d+)?$/.test(origin)) {
        return origin;
      }
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "expo-platform",
      "x-better-auth-client",
      "x-captcha-response",
    ],
    exposeHeaders: [
      "X-Request-Id",
      "X-Cache",
      "Set-Cookie",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
      "Retry-After",
    ],
    maxAge: 86400,
  }),
);

app.use(
  "*",
  secureHeaders({
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
    strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  }),
);

app.use("*", timeout(30000, () => new HTTPException(504, { message: "Gateway Timeout" })));
app.use("*", compress());
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

const v1 = new Hono<AppEnv>();
v1.route("/movies", movieRoutes);
app.route("/v1", v1);

app.get("/", (c) => {
  return c.json({ success: true, redis: redis?.status === "ready" });
});

app.onError((err, c) => {
  const reqId = c.get("requestId") ?? "-";
  console.error(`[${reqId}] Unhandled Error:`, err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  return c.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    500,
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Not Found",
    },
    404,
  );
});

export default app;
