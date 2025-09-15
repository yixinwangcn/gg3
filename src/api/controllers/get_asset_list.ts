import _ from "lodash";
import APIException from "@/lib/exceptions/APIException.ts";
import EX from "@/api/consts/exceptions.ts";
import { request } from "./core.ts";
import logger from "@/lib/logger.ts";

const DEFAULT_ASSISTANT_ID = "513695";

export interface AssetListParams {
  count?: number;
  direction?: number;
  mode?: string;
  option?: {
    image_info?: {
      width?: number;
      height?: number;
      format?: string;
      image_scene_list?: Array<{
        scene: string;
        width: number;
        height: number;
        uniq_key: string;
        format: string;
      }>;
    };
    origin_image_info?: {
      width?: number;
      height?: number;
      format?: string;
      image_scene_list?: Array<{
        scene: string;
        width: number;
        height: number;
        uniq_key: string;
        format: string;
      }>;
    };
    order_by?: number;
    only_favorited?: boolean;
    end_time_stamp?: number;
  };
  asset_type_list?: number[];
}

export interface AssetItem {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnail_url: string;
  created_at: number;
  updated_at: number;
  metadata?: Record<string, any>;
}

export interface AssetListResponse {
  assets: AssetItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function getAssetList(refreshToken: string, params: AssetListParams = {}) {
  try {
    // 调用即梦API获取数据
    const result = await request(
      "post",
      "/mweb/v1/get_asset_list",
      refreshToken,
      {
        data: {
          aid: DEFAULT_ASSISTANT_ID,
          da_version: "3.2.5",
          aigc_features: "app_lip_sync",
          count: params.count || 20,
          direction: params.direction || 1,
          mode: params.mode || "workbench",
          option: {
            image_info: {
              width: 2048,
              height: 2048,
              format: "webp",
              image_scene_list: [
                { scene: "normal", width: 2400, height: 2400, uniq_key: "2400", format: "webp" },
                { scene: "loss", width: 1080, height: 1080, uniq_key: "1080", format: "webp" },
                { scene: "loss", width: 900, height: 900, uniq_key: "900", format: "webp" },
                { scene: "loss", width: 720, height: 720, uniq_key: "720", format: "webp" },
                { scene: "loss", width: 480, height: 480, uniq_key: "480", format: "webp" },
                { scene: "loss", width: 360, height: 360, uniq_key: "360", format: "webp" }
              ]
            },
            origin_image_info: {
              width: 96,
              height: 2048,
              format: "webp",
              image_scene_list: [
                { scene: "normal", width: 2400, height: 2400, uniq_key: "2400", format: "webp" },
                { scene: "loss", width: 1080, height: 1080, uniq_key: "1080", format: "webp" },
                { scene: "loss", width: 900, height: 900, uniq_key: "900", format: "webp" },
                { scene: "loss", width: 720, height: 720, uniq_key: "720", format: "webp" },
                { scene: "loss", width: 480, height: 480, uniq_key: "480", format: "webp" },
                { scene: "loss", width: 360, height: 360, uniq_key: "360", format: "webp" }
              ]
            },
            order_by: params.option?.order_by || 0,
            only_favorited: params.option?.only_favorited || false,
            end_time_stamp: params.option?.end_time_stamp || 0
          },
          asset_type_list: params.asset_type_list || [1, 2, 5, 6, 7, 8, 9]
        }
      }
    );

    logger.info(`获取资产列表响应: ${JSON.stringify(result)}`);

    if (!result) {
      throw new APIException(EX.API_REQUEST_FAILED, "获取资产列表失败: 服务器返回空响应");
    }

    if (typeof result !== 'object') {
      throw new APIException(EX.API_REQUEST_FAILED, "获取资产列表失败: 响应格式错误");
    }

    // 直接返回原始响应数据
    return result;
  } catch (error) {
    logger.error(`获取资产列表失败: ${error}`);
    throw error;
  }
}

export default {
  getAssetList
}; 