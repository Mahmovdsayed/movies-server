import { validator } from "hono/validator";
import type { z } from "zod";

type Target = "json" | "query" | "param" | "header";

export function zValidate<S extends z.ZodTypeAny>(target: Target, schema: S) {
  return validator(target, (value, c) => {
    const result = schema.safeParse(value);

    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.issues.map((iss) => ({
            path: iss.path.join("."),
            message: iss.message,
          })),
        },
        400,
      );
    }

    return result.data;
  });
}
