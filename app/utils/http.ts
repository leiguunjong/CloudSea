// utils/http.ts
import { fetch } from 'expo/fetch';

// 定义请求方法的字面类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置接口
interface RequestConfig {
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
  [key: string]: any; // 允许其他配置项
}

// 统一的响应格式接口（模仿 axios）
interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
  ok: boolean;
}

// 自定义 HTTP 错误类
export class HttpError<T = any> extends Error {
  status: number;
  response: HttpResponse<T> | null;

  constructor(message: string, status: number, response: HttpResponse<T> | null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

// 拦截器类型
type RequestInterceptor = (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
type ResponseInterceptor<T = any> = (
  response: HttpResponse<T> | HttpError<T>
) => Promise<HttpResponse<T> | HttpError<T>> | HttpResponse<T> | HttpError<T>;

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(baseURL: string = '', defaultOptions: RequestConfig = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(defaultOptions.headers as Record<string, string>),
  };

  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  const runRequestInterceptors = async (config: RequestConfig): Promise<RequestConfig> => {
    let currentConfig = config;
    for (const interceptor of requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  };

  const runResponseInterceptors = async <T>(response: HttpResponse<T> | HttpError<T>) => {
    let currentResponse: HttpResponse<T> | HttpError<T> = response;
    for (const interceptor of responseInterceptors) {
      currentResponse = await interceptor(currentResponse);
    }
    return currentResponse;
  };

  /**
   * 核心请求方法
   */
  const request = async <T = any>(endpoint: string, options: RequestConfig = {}): Promise<HttpResponse<T>> => {
    let config: RequestConfig = {
      method: 'GET',
      timeout: 15000,
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
    };

    config = await runRequestInterceptors(config);

    const url = `${baseURL}${endpoint}`;

    // 超时控制
    const controller = new AbortController();
    const timeoutMs = config.timeout ?? 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    config.signal = controller.signal;

    // 对 GET/HEAD 请求，移除 body
    const method = (config.method || 'GET').toUpperCase();
    if (['GET', 'HEAD'].includes(method)) {
      delete config.body;
    } else if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // 解析响应数据
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      const unifiedResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
        ok: response.ok,
      };

      if (!response.ok) {
        const error = new HttpError<T>(
          `请求失败: ${response.status} ${response.statusText}`,
          response.status,
          unifiedResponse
        );
        const intercepted = await runResponseInterceptors<T>(error);
        throw intercepted;
      }

      return (await runResponseInterceptors<T>(unifiedResponse)) as HttpResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (!(error instanceof HttpError)) {
        if (error.name === 'AbortError') {
          const timeoutError = new HttpError<T>('请求超时', 408, null);
          throw await runResponseInterceptors<T>(timeoutError);
        }
        const networkError = new HttpError<T>('网络错误，请检查网络连接', 0, null);
        throw await runResponseInterceptors<T>(networkError);
      }
      throw error;
    }
  };

  return {
    get: <T = any>(url: string, config?: RequestConfig) =>
      request<T>(url, { ...config, method: 'GET' }),
    post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      request<T>(url, { ...config, method: 'POST', body: data }),
    put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      request<T>(url, { ...config, method: 'PUT', body: data }),
    patch: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      request<T>(url, { ...config, method: 'PATCH', body: data }),
    delete: <T = any>(url: string, config?: RequestConfig) =>
      request<T>(url, { ...config, method: 'DELETE' }),

    addRequestInterceptor: (interceptor: RequestInterceptor) => {
      requestInterceptors.push(interceptor);
    },
    addResponseInterceptor: <T = any>(interceptor: ResponseInterceptor<T>) => {
      responseInterceptors.push(interceptor as ResponseInterceptor);
    },

    setHeader: (key: string, value: string) => {
      defaultHeaders[key] = value;
    },
    removeHeader: (key: string) => {
      delete defaultHeaders[key];
    },

    HttpError,
  };
}

// 创建一个全局默认实例（按需修改 baseURL）
const http = createHttpClient('https://api.example.com');

export default http;