export interface IResponse {
  code: number;
  msg?: string;
  data?: any;
}

export interface IPagination {
  pageNum: number;
  pageSize: number;
  query?: string;
}
