export function unwrap<T extends { data?: any; error?: any }>(
  response: T
): T["data"] {
  if (response.error) throw response.error;
  return response.data;
}
