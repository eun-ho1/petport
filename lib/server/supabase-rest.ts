import { ApiError } from "@/lib/server/api-errors"

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

interface SupabaseRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  query?: Record<string, string | number | boolean | undefined>
  body?: Json | Json[]
  headers?: Record<string, string>
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceRoleKey || !anonKey) {
    throw new ApiError(
      500,
      "SUPABASE_CONFIG_MISSING",
      "Supabase environment variables are not configured."
    )
  }

  return {
    url: url.replace(/\/$/, ""),
    restUrl: `${url.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey,
    anonKey,
  }
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
) {
  const { restUrl } = getSupabaseConfig()
  const url = new URL(`${restUrl}/${path}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url
}

async function parseResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function supabaseRequest<T>(
  path: string,
  options: SupabaseRequestOptions = {}
): Promise<T> {
  const { serviceRoleKey } = getSupabaseConfig()
  const url = buildUrl(path, options.query)

  const response = await fetch(url, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
      "Content-Type": "application/json; charset=utf-8",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "SUPABASE_REQUEST_FAILED",
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: string }).message)
        : "Database request failed.",
      payload
    )
  }

  return payload as T
}
