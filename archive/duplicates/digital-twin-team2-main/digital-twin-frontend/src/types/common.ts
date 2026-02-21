// Common types used across the application

export interface UserType {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponseType<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMetaType {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseType<T> extends ApiResponseType<T[]> {
  meta: PaginationMetaType;
}
