import z from "zod";

export const paramValidationSchema = z.compile(
  z.object({
    id: z.string().trim().min(1),
  }),
);

export type ParamRequest = z.infer<typeof paramValidationSchema>;
