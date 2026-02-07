import axios, { AxiosInstance, AxiosError } from "axios";
import { API_TIMEOUT } from "@/constants/api";

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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
