import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types/app";
import { auth } from "../infrastructure/auth/auth";

export const requireAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  };
};
