/**
 * Builds the multipart body the upload endpoints expect.
 *
 * Routes that accept a file run `uploadMediaToS3(...)` then `parseRequestData`,
 * and that pair reads the JSON body from a single stringified `data` field
 * rather than from individual form fields — so a plain object of fields would
 * fail validation. Files go in under the field name the route was configured
 * with (`image` for blogs, hiring and promotions).
 *
 *   buildMediaFormData(payload, { image: file })
 *
 * Pass no files and the request still works: the endpoint just receives the
 * JSON, which is how a metadata-only edit keeps the stored image.
 *
 * Note: never set a Content-Type header alongside this. The browser has to
 * generate its own multipart boundary, and RTK Query leaves FormData alone.
 */
export function buildMediaFormData(
  payload: unknown,
  files: Record<string, File | File[] | null | undefined> = {},
): FormData {
  const formData = new FormData();

  formData.append("data", JSON.stringify(payload));

  Object.entries(files).forEach(([field, value]) => {
    if (!value) return;

    // Multi-file fields repeat the same key, which is what multer's array
    // handling expects.
    if (Array.isArray(value)) {
      value.forEach((file) => formData.append(field, file));
      return;
    }

    formData.append(field, value);
  });

  return formData;
}

export default buildMediaFormData;
