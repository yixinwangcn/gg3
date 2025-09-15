import _ from "lodash";

import Request from "@/lib/request/Request.ts";
import { generateImages, getImageByHistoryId } from "@/api/controllers/images.ts";
import { getAssetList } from "@/api/controllers/get_asset_list.ts";
import { tokenSplit } from "@/api/controllers/core.ts";
import util from "@/lib/util.ts";

export default {
  prefix: "/v1/images",

  post: {
    "/generations": async (request: Request) => {
      request
        .validate("body.model", v => _.isUndefined(v) || _.isString(v))
        .validate("body.prompt", _.isString)
        .validate("body.negative_prompt", v => _.isUndefined(v) || _.isString(v))
        .validate("body.width", v => _.isUndefined(v) || _.isFinite(v))
        .validate("body.height", v => _.isUndefined(v) || _.isFinite(v))
        .validate("body.sample_strength", v => _.isUndefined(v) || _.isFinite(v))
        .validate("body.response_format", v => _.isUndefined(v) || _.isString(v))
        .validate("headers.authorization", _.isString);
      // refresh_token切分
      const tokens = tokenSplit(request.headers.authorization);
      // 随机挑选一个refresh_token
      const token = _.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        sample_strength: sampleStrength,
        response_format,
      } = request.body;
      
      const result = await generateImages(model, prompt, {
        width,
        height,
        sampleStrength,
        negativePrompt,
      }, token);

      return {
        created: util.unixTimestamp(),
        data: result
      };
    },

    "/get_history_by_ids": async (request: Request) => {
      request
        .validate("body.history_ids", v => _.isString(v) || _.isArray(v))
        .validate("headers.authorization", _.isString);

      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);
      const { history_ids } = request.body;

      // 如果history_ids是字符串，转换为数组
      const historyIds = _.isString(history_ids) ? [history_ids] : history_ids;

      const result = await getImageByHistoryId(historyIds[0], token);
      return {
        created: util.unixTimestamp(),
        data: result.images
      };
    },

    "/get_asset_list": async (request: Request) => {
      request
        .validate("headers.authorization", _.isString)
        .validate("body.count", v => _.isUndefined(v) || _.isFinite(Number(v)))
        .validate("body.direction", v => _.isUndefined(v) || _.isFinite(Number(v)))
        .validate("body.mode", v => _.isUndefined(v) || _.isString(v))
        .validate("body.option", v => _.isUndefined(v) || _.isObject(v))
        .validate("body.asset_type_list", v => _.isUndefined(v) || _.isArray(v));

      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);

      const params = {
        count: request.body.count ? Number(request.body.count) : undefined,
        direction: request.body.direction ? Number(request.body.direction) : undefined,
        mode: request.body.mode,
        option: request.body.option,
        asset_type_list: request.body.asset_type_list
      };

      const result = await getAssetList(token, params);
      return {
        created: util.unixTimestamp(),
        data: result
      };
    }
  }
};
