import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "@/constants/api";

type RedirectCallback = (url: string) => void;

let redirectCallback: RedirectCallback | null = null;

export function setApiRedirectCallback(callback: RedirectCallback) {
  redirectCallback = callback;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      // Use the proxy API route instead of direct backend URL
      baseURL: "/api/proxy",
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
      // Enable sending cookies with requests
      withCredentials: true,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem("auth_token");
          // Use callback if available, fallback to window.location
          if (redirectCallback) {
            redirectCallback("/login");
          } else {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
