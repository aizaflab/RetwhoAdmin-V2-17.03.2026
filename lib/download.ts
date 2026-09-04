import { getSession } from "next-auth/react";

/**
 * Fetches an authenticated file from the API and hands it to the browser as a
 * download.
 *
 * This deliberately does not go through RTK Query. A query result is cached in
 * the Redux store, and a Blob is neither serializable nor something worth
 * keeping around — the serializability check flags it, and the file would sit
 * in memory long after it was saved. A download has no cacheable state: the
 * side effect *is* the result.
 *
 * The token is read the same way the base query reads it, so an expiring
 * access token is refreshed by the session callback before the request goes.
 */
export async function downloadAuthedFile(
  path: string,
  fallbackFileName: string,
): Promise<void> {
  const session = await getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`,
    {
      headers: session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {},
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    // A failure comes back as the usual JSON envelope even on a file route, so
    // the error is rethrown in the shape `getApiErrorMessage` reads.
    let data: unknown = undefined;
    try {
      data = await response.json();
    } catch {
      // A non-JSON body (a proxy error page, say) leaves the caller's fallback
      // message in place.
    }
    throw { status: response.status, data };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      fileNameFromDisposition(response.headers.get("content-disposition")) ??
      fallbackFileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // An object URL pins the blob in memory until it is revoked. The click has
    // already been dispatched by now, so the browser holds its own reference
    // for the duration of the save.
    URL.revokeObjectURL(url);
  }
}

/** The server's own name for the file, when it sends one. */
function fileNameFromDisposition(header: string | null): string | null {
  if (!header) return null;

  // `filename*=UTF-8''name.csv` wins over plain `filename="name.csv"` when
  // both are present — it is the one that survives non-ASCII characters.
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      // Malformed encoding — fall through to the plain form.
    }
  }

  return header.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
}

export default downloadAuthedFile;
