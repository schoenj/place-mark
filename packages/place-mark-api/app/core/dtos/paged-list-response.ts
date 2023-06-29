export interface IPagedListResponse<T> {
  page: number;
  perPage: number;
  totalPages: number;
  data: T[];
}
