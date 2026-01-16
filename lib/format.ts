/**
 * Format a number as Indian currency (₹) with lakhs/crores notation.
 * Examples:
 *   1000 -> ₹1,000
 *   100000 -> ₹1,00,000 (1 lakh)
 *   10000000 -> ₹1,00,00,000 (1 crore)
 */
export function formatIndianCurrency(num: number): string {
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as Indian notation without currency symbol.
 * Useful for displaying amounts in context where ₹ is already shown.
 */
export function formatIndianNumber(num: number): string {
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

/**
 * Format a percentage value.
 * Example: 12.5 -> "12.5%"
 */
export function formatPercent(num: number): string {
  return `${num}%`;
}

/**
 * Format years with proper pluralization.
 * Examples:
 *   1 -> "1 year"
 *   10 -> "10 years"
 */
export function formatYears(num: number): string {
  return `${num} ${num === 1 ? "year" : "years"}`;
}

/**
 * Format months with proper pluralization.
 */
export function formatMonths(num: number): string {
  return `${num} ${num === 1 ? "month" : "months"}`;
}
