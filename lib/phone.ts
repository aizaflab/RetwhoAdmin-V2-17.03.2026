/** Max digits in a US phone number, area code included. */
const PHONE_DIGITS = 10;

/**
 * Formats a phone number as `(xxx) xxx-xxxx`, progressively — so it can be
 * used on every keystroke. Non-digits are dropped, a leading US country code
 * (`1`) is ignored and anything past ten digits is cut off.
 *
 *   "555"        -> "(555"
 *   "5551234"    -> "(555) 123-4"
 *   "5551234567" -> "(555) 123-4567"
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  let digits = (value ?? "").replace(/\D/g, "");
  if (digits.length > PHONE_DIGITS && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, PHONE_DIGITS);

  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Placeholder matching the {@link formatPhoneNumber} output. */
export const PHONE_PLACEHOLDER = "(555) 123-4567";
