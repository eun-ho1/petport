import { ApiError } from "@/lib/server/api-errors"
import { getSupabaseConfig, supabaseRequest } from "@/lib/server/supabase-rest"

export interface RequestContext {
  userId: string
  profileId: string
  shelterId: string
  role: "admin" | "staff" | "volunteer"
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? ""
  const [scheme, token] = authorization.split(" ")

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Missing access token. Provide Authorization: Bearer <supabase-access-token>."
    )
  }

  return token
}

async function fetchAuthenticatedUser(accessToken: string) {
  const { url, anonKey } = getSupabaseConfig()

  const response = await fetch(`${url}/auth/v1/user`, {
    method: "GET",
    cache: "no-store",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.id) {
    throw new ApiError(401, "INVALID_ACCESS_TOKEN", "The access token is invalid or expired.", payload)
  }

  return payload as { id: string; email?: string | null }
}

export async function getRequestContext(request: Request): Promise<RequestContext> {
  const accessToken = getBearerToken(request)
  const user = await fetchAuthenticatedUser(accessToken)

  const profiles = await supabaseRequest<
    Array<{
      id: string
      shelter_id: string | null
      role: "admin" | "staff" | "volunteer"
      is_active: boolean
    }>
  >("profiles", {
    query: {
      select: "id,shelter_id,role,is_active",
      id: `eq.${user.id}`,
      limit: 1,
    },
  })

  const profile = profiles[0]

  if (!profile) {
    throw new ApiError(403, "PROFILE_NOT_FOUND", "No profile is linked to the authenticated user.")
  }

  if (!profile.is_active) {
    throw new ApiError(403, "PROFILE_INACTIVE", "The authenticated profile is inactive.")
  }

  if (!profile.shelter_id) {
    throw new ApiError(403, "SHELTER_NOT_ASSIGNED", "The authenticated user is not assigned to a shelter.")
  }

  return {
    userId: user.id,
    profileId: profile.id,
    shelterId: profile.shelter_id,
    role: profile.role,
  }
}
