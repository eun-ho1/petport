import { ApiError } from "@/lib/server/api-errors"
import { apiSuccess, withRouteHandler } from "@/lib/server/api-response"
import { resolveHealthAlertSchema } from "@/lib/server/api-schemas"
import { getRequestContext } from "@/lib/server/request-context"
import { mapHealthAlert } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

async function getAlert(id: string, shelterId: string) {
  const records = await supabaseRequest<any[]>("health_alerts", {
    query: {
      select:
        "id,dog_id,alert_type,priority,title,description,is_resolved,resolved_at,resolved_by,created_at,updated_at,dogs(name,primary_photo_url)",
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
      limit: 1,
    },
  })

  const alert = records[0]
  if (!alert) {
    throw new ApiError(404, "HEALTH_ALERT_NOT_FOUND", "Health alert not found.")
  }

  return alert
}

export const PATCH = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const context = await getRequestContext(request)
  const { id } = await params
  const body = resolveHealthAlertSchema.parse(await request.json().catch(() => ({})))

  await getAlert(id, context.shelterId)

  await supabaseRequest("health_alerts", {
    method: "PATCH",
    headers: {
      Prefer: "return=minimal",
    },
    query: {
      id: `eq.${id}`,
      shelter_id: `eq.${context.shelterId}`,
    },
    body: {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: body.resolvedBy ?? context.profileId ?? null,
    },
  })

  const updated = await getAlert(id, context.shelterId)

  return apiSuccess({
    item: mapHealthAlert(updated),
  })
})
