import { Hono } from "hono";
import type { AppEnv } from "../../types/app";
import { requireAuth } from "../../middleware/auth";
import { cacheMiddleware } from "../../middleware/cache";
import { zValidate } from "../../middleware/validate";
import { paramValidationSchema } from "../../validation/global/param.validation";
import { likeMovieSchema } from "./movies.schema";
import { getLikedMoviesController, likeMovieController, unlikeMovieController } from "./movies.controller";

const movieRoutes = new Hono<AppEnv>();

movieRoutes.get("/liked", requireAuth(), cacheMiddleware({ keyPrefix: "LikedMovies" }), getLikedMoviesController);
movieRoutes.post("/liked", requireAuth(), zValidate("json", likeMovieSchema), likeMovieController);
movieRoutes.delete("/liked/:id", requireAuth(), zValidate("param", paramValidationSchema), unlikeMovieController);

export default movieRoutes;
