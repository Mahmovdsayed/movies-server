import type { User } from "./user";

declare module "hono" {
  interface ContextVariableMap {
    user: User;
    session: any;
    requestId: string;
  }
}

export type AppEnv = {
  Variables: {
    user: User;
    session?: any;
    requestId?: string;
  };
};
