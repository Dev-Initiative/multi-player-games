// Mirrors the players_username_format constraint in V1__initial_schema.sql.
// Uniqueness is case-insensitive on the server, so "Ada" and "ada" collide.
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

export const PASSWORD_MIN = 8
// bcrypt ignores everything past 72 bytes, so longer passwords give a false
// sense of security. Measured in bytes, not characters.
export const PASSWORD_MAX_BYTES = 72

export function validateUsername(username: string) {
  if (!username) return 'Pick a username'
  if (username.length < 3) return 'At least 3 characters'
  if (username.length > 20) return 'At most 20 characters'
  if (!USERNAME_PATTERN.test(username)) return 'Letters, numbers and _ only'
  return undefined
}

export function validatePassword(password: string) {
  if (!password) return 'Choose a password'
  if (password.length < PASSWORD_MIN) return `At least ${PASSWORD_MIN} characters`
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return 'That password is too long'
  return undefined
}
