export interface HttpAdaptar {
  get<T>(url: string): Promise<T>;
}
