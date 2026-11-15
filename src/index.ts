import { Context, Hono } from "hono";
import { compress } from "hono/compress";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";

const app = new Hono().basePath("/v1");

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

app.use(
  "*",
  timeout(30000, () => new HTTPException(504, { message: "Gateway Timeout" })),
);
app.use("*", compress());


export default app;
