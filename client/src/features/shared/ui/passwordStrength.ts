/** 0 (too short) to 4. A nudge, not a policy: the only hard rule is the minimum length. */
export function passwordStrength(password: string) {
  if (password.length < 8) return 0
  let score = 1
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}
