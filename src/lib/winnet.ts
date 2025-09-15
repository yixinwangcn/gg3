import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const wininet = require('wininet');

export interface WinINetOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export async function wininetRequest(options: WinINetOptions): Promise<any> {
  const {
    method = 'GET',
    url,
    headers = {},
    data,
    timeout = 30000
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // 创建 WinINet 会话
      const session = wininet.InternetOpen('jimeng-api', 0, null, null, 0);
      
      // 设置超时
      wininet.InternetSetOption(session, 2, timeout); // INTERNET_OPTION_CONNECT_TIMEOUT
      wininet.InternetSetOption(session, 3, timeout); // INTERNET_OPTION_SEND_TIMEOUT
      wininet.InternetSetOption(session, 4, timeout); // INTERNET_OPTION_RECEIVE_TIMEOUT

      // 解析 URL
      const urlObj = new URL(url);
      const host = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;

      // 创建连接
      const connection = wininet.InternetConnect(
        session,
        host,
        urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80),
        null,
        null,
        3, // INTERNET_SERVICE_HTTP
        0,
        0
      );

      // 创建请求
      const request = wininet.HttpOpenRequest(
        connection,
        method,
        path,
        null,
        null,
        null,
        urlObj.protocol === 'https:' ? 0x00800000 : 0, // INTERNET_FLAG_SECURE for HTTPS
        0
      );

      // 设置请求头
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      };

      const allHeaders = { ...defaultHeaders, ...headers };
      const headerString = Object.entries(allHeaders)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n') + '\r\n\r\n';

      wininet.HttpAddRequestHeaders(request, headerString, -1);

      // 发送请求
      let requestData = '';
      if (data) {
        requestData = typeof data === 'string' ? data : JSON.stringify(data);
      }

      const sendResult = wininet.HttpSendRequest(request, null, 0, requestData, requestData.length);
      
      if (!sendResult) {
        const error = wininet.GetLastError();
        throw new Error(`WinINet request failed: ${error}`);
      }

      // 读取响应
      let responseData = '';
      const buffer = Buffer.alloc(4096);
      let bytesRead;

      while ((bytesRead = wininet.InternetReadFile(request, buffer, buffer.length)) > 0) {
        responseData += buffer.toString('utf8', 0, bytesRead);
      }

      // 获取响应头
      const responseHeaders = wininet.HttpQueryInfo(request, 19); // HTTP_QUERY_RAW_HEADERS_CRLF

      // 解析响应
      let response;
      try {
        response = JSON.parse(responseData);
      } catch (e) {
        response = responseData;
      }

      // 清理资源
      wininet.InternetCloseHandle(request);
      wininet.InternetCloseHandle(connection);
      wininet.InternetCloseHandle(session);

      resolve({
        data: response,
        headers: responseHeaders,
        status: 200
      });
    } catch (error) {
      reject(error);
    }
  });
}

// 使用示例
export async function getAssetListExample() {
  try {
    const response = await wininetRequest({
      method: 'POST',
      url: 'http://localhost:3000/v1/images/assets',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        count: 20,
        direction: 1,
        mode: "workbench",
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
          order_by: 0,
          only_favorited: false,
          end_time_stamp: 0
        },
        asset_type_list: [1, 2, 5, 6, 7, 8, 9]
      }
    });

    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
} 