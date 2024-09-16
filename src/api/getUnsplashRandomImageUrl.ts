import { AxiosResponse } from "axios";
import { unsplashApi } from "~/api/unsplash";

export const getUnsplashRandomImageUrl = async () => {
  try {
    // TODO: queryによる検索
    const response: AxiosResponse = await unsplashApi.get("/photos/random");
    const headers = response.headers;
    if (!headers) return;

    const requestLimit: number = headers["x-ratelimit-limit"];
    const requestRemaining: number = headers["x-ratelimit-remaining"];
    const url: string = response.data.urls.full;

    return { url, requestLimit, requestRemaining };
  } catch (error) {
    // TODO: 403の時、API制限であることがわかるようなエラー表示
    console.error(error);
    return { url: "", requestLimit: 50, requestRemaining: 0 };
  }
};
