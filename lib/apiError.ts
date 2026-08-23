/**
 * Pulls the human-readable message out of an RTK Query error.
 *
 * The backend answers failures with
 * `{ success: false, statusCode, message, error: [{ path, message }] }`,
 * so the specific per-field message (e.g. the one Zod produced) is preferred
 * over the generic top-level one — "name must be at least 2 characters" is
 * more useful to show than "Validation Error".
 */

interface ApiErrorShape {
  status?: number;
  data?: {
    message?: string;
    error?: { path?: string; message?: string }[];
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const body = (error as ApiErrorShape)?.data;

  const fieldMessage = body?.error?.find((item) => item?.message)?.message;
  if (fieldMessage) return fieldMessage;

  return body?.message || fallback;
}

/** HTTP status of a failed request, when the error carries one. */
export function getApiErrorStatus(error: unknown): number | undefined {
  const status = (error as ApiErrorShape)?.status;
  return typeof status === "number" ? status : undefined;
}
