export interface ResponseData<T> {
  data: T | T[];
  statusCode: number;
  message: string;
}

export interface PaginationMeta {
  total: number;
  pageNumber: number;
  limitNumber: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}