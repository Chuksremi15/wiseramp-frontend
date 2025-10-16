import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { isTokenExpired } from "./auth";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_LOCAL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and check for expiry
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");

    // If token exists and is not expired, add it to the request headers
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, handle it before making the request
        // This will be caught in the error handler
        return Promise.reject(new Error("Token expired"));
      }

      // Add token to headers
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Only handle token expiration from request interceptor (client-side check)
    if (error.message === "Token expired") {
      // Clear auth data from localStorage
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");

      // Return the original error so components can handle it
      return Promise.reject(new Error(error.message));
    }

    // Let 401s and other backend errors pass through unchanged
    // This allows components to access error.response.data.message

    return Promise.reject(error);
  }
);

export default api;
