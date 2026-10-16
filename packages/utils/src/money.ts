/**
 * Formats an amount in paise to Indian Rupee currency string: ₹X,XXX.XX
 * e.g., 100000 -> ₹1,000.00, 150 -> ₹1.50, 0 -> ₹0.00
 */
export function paiseToCurrency(paise: number): string {
  if (!Number.isFinite(paise)) {
    throw new Error('Invalid paise amount');
  }

  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts Indian Rupees (can be decimal) to integer paise.
 * Uses Math.round to avoid floating point precision artifacts.
 */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) {
    throw new Error('Invalid rupee amount');
  }
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise to Indian Rupees (decimal).
 */
export function paisToRupees(paise: number): number {
  if (!Number.isFinite(paise)) {
    throw new Error('Invalid paise amount');
  }
  return Number((paise / 100).toFixed(2));
}

// Alias for convenience if spelled paiseToRupees
export const paiseToRupees = paisToRupees;
