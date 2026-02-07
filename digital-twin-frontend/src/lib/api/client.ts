import axios, { AxiosInstance } from "axios";
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
