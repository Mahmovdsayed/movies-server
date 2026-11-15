import {
  pgTable,
  pgEnum,
  text,
  real,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const mediaTypeEnum = pgEnum("media_type", ["movie", "series"]);

export const likedMoviesTable = pgTable(
  "liked_movies",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    rating: real("rating").notNull(),
    likedAt: timestamp("liked_at", { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("liked_movies_user_id_idx").on(table.userId),
    uniqueIndex("liked_movies_user_id_media_idx").on(
      table.userId,
      table.mediaId,
      table.mediaType,
    ),
  ],
);
