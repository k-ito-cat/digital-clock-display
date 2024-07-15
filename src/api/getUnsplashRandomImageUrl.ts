import { unsplashApi } from "~/api/unsplash";

export const getUnsplashRandomImageUrl = async () => {
  try {
    // TODO: queryによる検索
    const response = await unsplashApi.get("/photos/random");
    return response.data.urls.full;
  } catch (error) {
    // TODO: 403の時、API制限であることがわかるようなエラー表示
    console.error(error);
  }
};
