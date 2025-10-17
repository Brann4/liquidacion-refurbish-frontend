export interface ApiResponse<T> {
  status: boolean;
  msg: string;
  value: T[];
}
