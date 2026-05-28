export interface AuthSession {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email?: string | null
  }
}

const STORAGE_KEY = "pawbridge.auth.session"

function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase auth environment variables are not configured.")
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

export async function fetchAuthenticatedUser(accessToken: string) {
  const { url, anonKey } = getAuthConfig()

  const response = await fetch(`${url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.id) {
    throw new Error("Your session is invalid or has expired. Please sign in again.")
  }

  return payload as { id: string; email?: string | null }
}

export async function signInWithPassword(email: string, password: string) {
  const { url, anonKey } = getAuthConfig()

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      typeof payload?.msg === "string"
        ? payload.msg
        : "Unable to sign in with the provided email and password."
    )
  }

  const session: AuthSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? undefined,
    user: {
      id: payload.user?.id ?? "",
      email: payload.user?.email ?? email,
    },
  }

  saveSession(session)
  return session
}

export async function validateStoredSession() {
  const session = getStoredSession()
  if (!session) return null

  try {
    const user = await fetchAuthenticatedUser(session.accessToken)
    const nextSession: AuthSession = {
      ...session,
      user: {
        id: user.id,
        email: user.email,
      },
    }
    saveSession(nextSession)
    return nextSession
  } catch {
    clearSession()
    return null
  }
}
