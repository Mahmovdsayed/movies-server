import { and, eq } from "drizzle-orm";
import { db } from "../../database";
import { likedMovies, type NewLikedMovie } from "../../database/schemas/movies";

export class MoviesRepository {
  static async findAllByUser(userId: string) {
    return db
      .select()
      .from(likedMovies)
      .where(eq(likedMovies.userId, userId))
      .orderBy(likedMovies.likedAt);
  }

  static async findOne(
    userId: string,
    mediaId: number,
    mediaType: "movie" | "series",
  ) {
    const [movie] = await db
      .select()
      .from(likedMovies)
      .where(
        and(
          eq(likedMovies.userId, userId),
          eq(likedMovies.mediaId, mediaId),
          eq(likedMovies.mediaType, mediaType),
        ),
      );
    return movie ?? null;
  }

  static async insert(data: Omit<NewLikedMovie, "id" | "likedAt">) {
    const [movie] = await db
      .insert(likedMovies)
      .values({ ...data, id: crypto.randomUUID() })
      .returning();
    return movie;
  }

  static async deleteOne(id: string, userId: string) {
    const [deleted] = await db
      .delete(likedMovies)
      .where(and(eq(likedMovies.id, id), eq(likedMovies.userId, userId)))
      .returning();
    return deleted ?? null;
  }
}
