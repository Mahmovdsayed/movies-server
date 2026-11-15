import type { AppContext } from "../../types/http";
import { invalidateCache } from "../../middleware/cache";
import type { ParamRequest } from "../../validation/global/param.validation";
import { moviesService } from "./movies.service";
import type { LikeMovieInput } from "./movies.schema";

type GetLikedMoviesCtx = AppContext;
type LikeMovieCtx = AppContext<{ out: { json: LikeMovieInput } }>;
type UnlikeMovieCtx = AppContext<{ out: { param: ParamRequest } }>;

const LIKED_MOVIES_CACHE_KEY = "LikedMovies";

export const getLikedMoviesController = async (c: GetLikedMoviesCtx) => {
  try {
    const { id: userId } = c.get("user");
    const movies = await moviesService.getLikedMovies(userId);
    return c.json({ success: true, data: movies });
  } catch {
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
};

export const likeMovieController = async (c: LikeMovieCtx) => {
  try {
    const { id: userId } = c.get("user");
    const input = c.req.valid("json");
    const movie = await moviesService.likeMovie(userId, input);

    await invalidateCache(`${LIKED_MOVIES_CACHE_KEY}:user:${userId}`);

    return c.json(
      {
        success: true,
        message: "Movie added to liked list",
        data: movie,
      },
      201,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "MOVIE_ALREADY_LIKED") {
      return c.json({ success: false, message: "Movie already liked" }, 409);
    }
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
};

export const unlikeMovieController = async (c: UnlikeMovieCtx) => {
  try {
    const { id: userId } = c.get("user");
    const { id } = c.req.valid("param");
    const movie = await moviesService.unlikeMovie(id, userId);

    await invalidateCache(`${LIKED_MOVIES_CACHE_KEY}:user:${userId}`);

    return c.json({
      success: true,
      message: "Movie removed from liked list",
      data: movie,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MOVIE_NOT_FOUND") {
      return c.json({ success: false, message: "Liked movie not found" }, 404);
    }
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
};
