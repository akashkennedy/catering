function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Returns whether a value contains exactly 10 phone digits. */
export function validatePhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  return digitsOnly(trimmed).length === 10;
}

/** Formats any 10-digit number as (123)-456-7890. */
export function formatPhone(value: string): string {
  let digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value.trim();
}

/** Normalizes an Indian customer number to 10 digits, or null when invalid. */
export function normalizeCustomerPhone(phone: string): string | null {
  let digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return digits.length === 10 ? digits : null;
}
