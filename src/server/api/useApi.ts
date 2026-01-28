import { readonly, type Ref, ref } from "vue";

export interface ApiRequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = any> {
  data: T | null;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  error: Error | null;
}

export interface UseApiOptions {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  interceptors?: {
    request?: (config: ApiRequestOptions) => ApiRequestOptions;
    response?: (response: ApiResponse) => ApiResponse;
    error?: (error: Error) => Error;
  };
}

export function useApi(options: UseApiOptions = {}) {
  const {
    baseURL = "",
    defaultHeaders = {},
    timeout = 10000,
    retries = 0,
    interceptors = {},
  } = options;

  const loading = ref(false);
  const error = ref<Error | null>(null);
  const lastResponse = ref<ApiResponse | null>(null);

  const isLoading = readonly(loading) as Ref<boolean>;
  const lastError = readonly(error) as Ref<Error | null>;
  const lastApiResponse = readonly(lastResponse) as Ref<ApiResponse | null>;

  const request = async <T = any>(options: ApiRequestOptions): Promise<ApiResponse<T>> => {
    loading.value = true;
    error.value = null;

    const config: ApiRequestOptions = {
      method: "GET",
      headers: { ...defaultHeaders },
      timeout,
      retries,
      ...options,
      url: baseURL + options.url,
    };

    try {
      // Apply request interceptor
      const finalConfig = interceptors.request ? interceptors.request(config) : config;

      const response = await fetch(finalConfig.url, {
        method: finalConfig.method,
        headers: finalConfig.headers,
        body: finalConfig.body ? JSON.stringify(finalConfig.body) : undefined,
        signal: AbortSignal.timeout(finalConfig.timeout || timeout),
      });

      const responseData = await response.json();

      let apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: null,
      };

      // Apply response interceptor
      if (interceptors.response) {
        apiResponse = interceptors.response(apiResponse);
      }

      lastResponse.value = apiResponse;
      return apiResponse;
    } catch (err) {
      const errorObj = err as Error;

      // Apply error interceptor
      const finalError = interceptors.error ? interceptors.error(errorObj) : errorObj;

      error.value = finalError;

      const errorResponse: ApiResponse<T> = {
        data: null,
        status: 0,
        statusText: "Network Error",
        headers: {},
        error: finalError,
      };

      lastResponse.value = errorResponse;
      return errorResponse;
    } finally {
      loading.value = false;
    }
  };

  const get = <T = any>(url: string, options: Omit<ApiRequestOptions, "url" | "method"> = {}) => {
    return request<T>({ ...options, url, method: "GET" });
  };

  const post = <T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, "url" | "method" | "body"> = {}) => {
    return request<T>({ ...options, url, body, method: "POST" });
  };

  const put = <T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, "url" | "method" | "body"> = {}) => {
    return request<T>({ ...options, url, body, method: "PUT" });
  };

  const del = <T = any>(url: string, options: Omit<ApiRequestOptions, "url" | "method"> = {}) => {
    return request<T>({ ...options, url, method: "DELETE" });
  };

  const patch = <T = any>(
    url: string,
    body?: any,
    options: Omit<ApiRequestOptions, "url" | "method" | "body"> = {},
  ) => {
    return request<T>({ ...options, url, body, method: "PATCH" });
  };

  return {
    isLoading,
    lastError,
    lastApiResponse,
    request,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}
