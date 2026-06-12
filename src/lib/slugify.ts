/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Generate a unique verification code for certificates.
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}
