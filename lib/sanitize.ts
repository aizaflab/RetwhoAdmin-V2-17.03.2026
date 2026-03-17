import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for rich text content (e.g., from WYSIWYG editors)
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: Return as-is (sanitize on client)
    return dirty;
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/**
 * Sanitize input to prevent XSS attacks
 * Use this for form inputs, search queries, etc.
 */
export function sanitizeInput(input: string): string {
  if (typeof window === "undefined") {
    // Server-side: Basic sanitization
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize object recursively
 * Useful for sanitizing entire form data objects
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeInput(item)
          : typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item,
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize URL to prevent javascript: protocol injection
 */
export function sanitizeUrl(url: string): string {
  const trimmedUrl = url.trim();

  // Block javascript:, data:, and vbscript: protocols
  if (
    /^(javascript|data|vbscript):/i.test(trimmedUrl) ||
    trimmedUrl.includes("<script") ||
    trimmedUrl.includes("onclick=")
  ) {
    return "";
  }

  return trimmedUrl;
}
