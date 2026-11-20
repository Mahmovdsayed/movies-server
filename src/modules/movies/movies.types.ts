import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { likedMoviesTable } from "../../database/schemas";

export type LikedMovie = InferSelectModel<typeof likedMoviesTable>;
export type NewLikedMovie = InferInsertModel<typeof likedMoviesTable>;

export interface CreateLikedMovie {
  mediaId: number;
  mediaType: "movie" | "series";
  title: string;
  imageUrl: string;
  rating: number;
  year?: number | undefined;
}

export interface IMoviesService {
  getLikedMovies(userId: string): Promise<LikedMovie[]>;
  likeMovie(userId: string, data: CreateLikedMovie): Promise<LikedMovie>;
  unlikeMovie(id: string, userId: string): Promise<LikedMovie>;
}
