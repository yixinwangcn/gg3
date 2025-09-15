import APIException from "@/lib/exceptions/APIException.ts";
import EX from "@/api/consts/exceptions.ts";
import { request } from "./core.ts";

const DEFAULT_ASSISTANT_ID = "513695";

export async function getImageByHistoryId(historyId: string, refreshToken: string) {
  const result = await request(
    "post",
    "/mweb/v1/get_history_by_ids",
    refreshToken,
    {
      data: {
        history_ids: [historyId],
        image_info: { width: 2048, height: 2048, format: "webp" },
        http_common_info: { aid: Number(DEFAULT_ASSISTANT_ID) }
      }
    }
  );

  if (!result[historyId]) {
    throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "历史记录不存在");
  }

  const item_list = result[historyId].item_list || [];

  // 打印返回的数据结构，帮助调试
  return {
    images: item_list.map(item => ({
      webp: item?.common_attr?.cover_url_map?.["2400"] || "",
      jpeg: item?.common_attr?.cover_url || "",
      cover: item?.common_attr?.cover_url_map?.["1080"] || "",
      largeimg: item?.image?.large_images?.[0]?.image_url || ""
    }))
  };
}
