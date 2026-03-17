import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Track ongoing requests for cancellation
const abortControllers = new Map<string, AbortController>();

// Generate unique request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add access token to headers
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add request ID for tracking
    const requestId = generateRequestId();
    config.headers["X-Request-ID"] = requestId;

    // Store abort controller for this request
    const abortController = new AbortController();
    config.signal = abortController.signal;
    abortControllers.set(requestId, abortController);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor with retry logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Remove abort controller after successful response
    const requestId = response.config.headers["X-Request-ID"] as string;
    if (requestId) {
      abortControllers.delete(requestId);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Remove abort controller
    if (originalRequest) {
      const requestId = originalRequest.headers["X-Request-ID"] as string;
      if (requestId) {
        abortControllers.delete(requestId);
      }
    }

    // Handle network errors with retry
    if (!error.response && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;

      if (retryCount < maxRetries) {
        originalRequest._retryCount = retryCount + 1;

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        return axiosInstance(originalRequest);
      }
    }

    // Handle 401 Unauthorized - Token refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens
        Cookies.set("accessToken", accessToken, {
          expires: 1 / 96, // 15 minutes
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
        Cookies.set("refreshToken", newRefreshToken, {
          expires: 30, // 30 days
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        // Update original request header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(error);

        // Clear auth data and redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        localStorage.removeItem("user");

        toast.error("Session expired. Please login again.");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    handleApiErrorWrapper(error);
    return Promise.reject(error);
  },
);

// Centralized error handling
const handleApiError = (error: AxiosError<{ message?: string }>) => {
  if (axios.isCancel(error)) {
    console.log("Request canceled:", error.message);
    return;
  }

  let errorMessage = "An unexpected error occurred";

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        errorMessage = message || "Bad request";
        break;
      case 401:
        errorMessage = message || "Unauthorized access";
        break;
      case 403:
        errorMessage = message || "Access forbidden";
        break;
      case 404:
        errorMessage = message || "Resource not found";
        break;
      case 422:
        errorMessage = message || "Validation error";
        break;
      case 429:
        errorMessage = message || "Too many requests. Please try again later.";
        break;
      case 500:
        errorMessage = message || "Internal server error";
        break;
      case 503:
        errorMessage = message || "Service unavailable";
        break;
      default:
        errorMessage = message || `Error: ${status}`;
    }
  } else if (error.request) {
    // Request made but no response received
    errorMessage = "Network error. Please check your connection.";
  }

  toast.error(errorMessage);
};

const handleApiErrorWrapper = (error: AxiosError) => {
  handleApiError(error as AxiosError<{ message?: string }>);
};

// Cancel all pending requests
export const cancelAllRequests = (message = "Requests canceled") => {
  abortControllers.forEach((controller) => {
    controller.abort(message);
  });
  abortControllers.clear();
};

// Cancel specific request by ID
export const cancelRequest = (requestId: string) => {
  const controller = abortControllers.get(requestId);
  if (controller) {
    controller.abort("Request canceled");
    abortControllers.delete(requestId);
  }
};

// API methods with TypeScript generics
export const api = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  },

  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  },

  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  },

  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  },

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  },
};

export default axiosInstance;
