
export interface ApiResponseSingle<T> {
  status: boolean;
  msg: string;
  value: T;
}
