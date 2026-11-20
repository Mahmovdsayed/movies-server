import { and, desc, eq } from "drizzle-orm";
import { db } from "../../database";
import { likedMoviesTable } from "../../database/schemas";
import type { CreateLikedMovie, IMoviesService, LikedMovie } from "./movies.types";

export class MoviesService implements IMoviesService {
  public async getLikedMovies(userId: string): Promise<LikedMovie[]> {
    return db
      .select()
      .from(likedMoviesTable)
      .where(eq(likedMoviesTable.userId, userId))
      .orderBy(desc(likedMoviesTable.likedAt));
  }

  public async likeMovie(
    userId: string,
    data: CreateLikedMovie,
  ): Promise<LikedMovie> {
    const [existing] = await db
      .select({ id: likedMoviesTable.id })
      .from(likedMoviesTable)
      .where(
        and(
          eq(likedMoviesTable.userId, userId),
          eq(likedMoviesTable.mediaId, data.mediaId),
          eq(likedMoviesTable.mediaType, data.mediaType),
        ),
      )
      .limit(1);

    if (existing) {
      throw new Error("MOVIE_ALREADY_LIKED");
    }

    const [movie] = await db
      .insert(likedMoviesTable)
      .values({
        id: crypto.randomUUID(),
        userId,
        mediaId: data.mediaId,
        mediaType: data.mediaType,
        title: data.title,
        imageUrl: data.imageUrl,
        rating: data.rating,
        year: data.year ?? null,
      })
      .returning();

    if (!movie) {
      throw new Error("MOVIE_LIKE_FAILED");
    }

    return movie;
  }

  public async unlikeMovie(id: string, userId: string): Promise<LikedMovie> {
    const [deleted] = await db
      .delete(likedMoviesTable)
      .where(
        and(eq(likedMoviesTable.id, id), eq(likedMoviesTable.userId, userId)),
      )
      .returning();

    if (!deleted) {
      throw new Error("MOVIE_NOT_FOUND");
    }

    return deleted;
  }
}

export const moviesService = new MoviesService();
