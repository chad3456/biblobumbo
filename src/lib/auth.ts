/**
 * Local-only auth. Accounts live in this browser's storage; passwords are
 * salted + SHA-256 hashed so they're never stored in plain text. Swap this
 * module for a real backend (Supabase, Firebase, …) to sync across devices.
 */

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function makeSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return toHex(await crypto.subtle.digest('SHA-256', data))
}

export function validateUsername(name: string): string | null {
  if (name.length < 3) return 'username needs 3+ characters bestie'
  if (name.length > 20) return 'username too long, keep it under 20'
  if (!/^[a-z0-9_.]+$/.test(name)) return 'only lowercase letters, numbers, _ and . allowed'
  return null
}

export function validatePassword(pw: string): string | null {
  if (pw.length < 6) return 'password needs 6+ characters (security is a vibe)'
  return null
}

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
