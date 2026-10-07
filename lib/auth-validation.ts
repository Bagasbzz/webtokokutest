/**
 * Password validation logic for Webtokoku
 * Rules:
 * - Min 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one symbol (non-alphanumeric)
 */
export function validatePassword(password: string): { isValid: boolean; message: string | null } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password minimal 8 karakter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung minimal satu huruf besar' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung minimal satu huruf kecil' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung minimal satu angka' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung minimal satu simbol (misal: @, #, $, !)' };
  }

  return { isValid: true, message: null };
}
