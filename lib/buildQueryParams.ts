/* eslint-disable @typescript-eslint/no-explicit-any */
export default function buildQueryParams(params: Record<string, any>): string {
  const queryParts: string[] = [];

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (value !== null && value !== undefined) {
        queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
  }

  return queryParts.join("&");
}
