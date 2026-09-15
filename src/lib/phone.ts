function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validatePhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  const digits = digitsOnly(trimmed);
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  return false;
}

export function formatPhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith("91")) {
    const ten = digits.slice(2);
    return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return value.trim();
}
