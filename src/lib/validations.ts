/**
 * Reusable validation utilities for form validation across the application.
 *
 * Usage pattern:
 * ```tsx
 * const [errors, setErrors] = useState<Record<string, string>>({});
 *
 * const validate = (): boolean => {
 *   const errs = validateFields({
 *     title: [required(title, 'Title'), minLength(title, 3, 'Title')],
 *     email: [required(email, 'Email'), validEmail(email, 'Email')],
 *   });
 *   setErrors(errs);
 *   return Object.keys(errs).length === 0;
 * };
 * ```
 */

// ─── Primitive Validators ──────────────────────────────────────

/** Returns an error string if the value is empty/blank, otherwise empty string. */
export function required(value: string, fieldName: string): string {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return '';
}

/** Returns an error string if the value is shorter than min, otherwise empty string. */
export function minLength(value: string, min: number, fieldName: string): string {
  if (value && value.trim().length < min) return `${fieldName} must be at least ${min} characters`;
  return '';
}

/** Returns an error string if the value is longer than max, otherwise empty string. */
export function maxLength(value: string, max: number, fieldName: string): string {
  if (value && value.trim().length > max) return `${fieldName} must be at most ${max} characters`;
  return '';
}

/** Returns an error string if the value is not a valid email format, otherwise empty string. */
export function validEmail(value: string, fieldName: string): string {
  if (!value || !value.trim()) return ''; // let `required` handle empty
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return `${fieldName} must be a valid email address`;
  return '';
}

/** Returns an error string if the value is not numeric, otherwise empty string. */
export function numeric(value: string, fieldName: string): string {
  if (!value || !value.trim()) return ''; // let `required` handle empty
  if (isNaN(Number(value))) return `${fieldName} must be a number`;
  return '';
}

/** Returns an error string if the numeric value is less than min, otherwise empty string. */
export function min(value: string | number, minVal: number, fieldName: string): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return ''; // let `numeric` handle non-numbers
  if (num < minVal) return `${fieldName} must be at least ${minVal}`;
  return '';
}

/** Returns an error string if the numeric value is greater than max, otherwise empty string. */
export function max(value: string | number, maxVal: number, fieldName: string): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return ''; // let `numeric` handle non-numbers
  if (num > maxVal) return `${fieldName} must be at most ${maxVal}`;
  return '';
}

/** Returns an error string if the value is not greater than zero, otherwise empty string. */
export function positiveNumber(value: string | number, fieldName: string): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (num <= 0) return `${fieldName} must be greater than 0`;
  return '';
}

/** Returns an error string if the date is not in the future, otherwise empty string. */
export function futureDate(value: string | Date, fieldName: string): string {
  if (!value) return `${fieldName} is required`;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
  const now = new Date();
  // Compare dates only (not time) — same day is OK
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (inputDate < today) return `${fieldName} must be today or in the future`;
  return '';
}

/** Returns an error string if endDate is not after startDate, otherwise empty string. */
export function dateAfter(endDate: string | Date, startDate: string | Date, fieldLabel: string): string {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  if (isNaN(end.getTime()) || isNaN(start.getTime())) return '';
  if (end <= start) return `${fieldLabel} must be after start date`;
  return '';
}

// ─── Composite Validator ───────────────────────────────────────

/**
 * Validates a set of fields by running each through an array of validator functions.
 * Returns an object with field names as keys and the first error message as value.
 *
 * @example
 * ```ts
 * const errors = validateFields({
 *   title: [required(title, 'Title'), minLength(title, 3, 'Title')],
 *   price: [required(price, 'Price'), numeric(price, 'Price'), min(price, 0, 'Price')],
 * });
 * // errors = { title: 'Title must be at least 3 characters', price: '' }
 * ```
 */
export function validateFields(
  fieldValidations: Record<string, string[]>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [fieldName, validators] of Object.entries(fieldValidations)) {
    for (const error of validators) {
      if (error) {
        errors[fieldName] = error;
        break; // Only show first error per field
      }
    }
  }
  return errors;
}
