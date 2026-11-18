import { env } from "../../config/env";
import { TMDB_API_URL } from "../../constant/constant";

export const tmdbApi = {
  get: async <T>(url: string, params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    const endpoint = `${TMDB_API_URL}${url}${query ? `?${query}` : ""}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  },
};