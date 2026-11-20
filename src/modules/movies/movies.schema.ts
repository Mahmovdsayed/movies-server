import z from "zod";

export const likeMovieSchema = z.compile(
  z.object({
    mediaId: z.number().int().positive(),
    mediaType: z.enum(["movie", "series"]),
    title: z.string().trim().min(1),
    imageUrl: z.string().trim().url(),
    rating: z.number().min(0).max(10),
    year: z.number().int().optional(),
  }),
);

export type LikeMovieInput = z.infer<typeof likeMovieSchema>;