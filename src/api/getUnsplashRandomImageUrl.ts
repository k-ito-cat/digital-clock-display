import { AxiosResponse } from "axios";
import { unsplashApi } from "~/api/unsplash";

interface UnsplashRandomParams {
  query?: string;
}

export const getUnsplashRandomImageUrl = async ({ query }: UnsplashRandomParams = {}) => {
  try {
    const response: AxiosResponse = await unsplashApi.get("/photos/random", {
      params: query ? { query } : undefined,
    });
    const headers = response.headers;
    if (!headers) return;

    const requestLimit: number = headers["x-ratelimit-limit"];
    const requestRemaining: number = headers["x-ratelimit-remaining"];
    const url: string = response.data.urls.full;

    return { url, requestLimit, requestRemaining };
  } catch (error) {
    console.error(error);
    return { url: "", requestLimit: 50, requestRemaining: 0 };
  }
};
