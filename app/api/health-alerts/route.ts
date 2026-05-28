import { apiSuccess, withRouteHandler } from "@/lib/server/api-response"
import { getRequestContext } from "@/lib/server/request-context"
import { mapHealthAlert } from "@/lib/server/api-mappers"
import { supabaseRequest } from "@/lib/server/supabase-rest"

export const GET = withRouteHandler(async (request: Request) => {
  const { shelterId } = await getRequestContext(request)
  const url = new URL(request.url)
  const resolved = url.searchParams.get("resolved")

  const records = await supabaseRequest<any[]>("health_alerts", {
    query: {
      select:
        "id,dog_id,alert_type,priority,title,description,is_resolved,resolved_at,resolved_by,created_at,updated_at,dogs(name,primary_photo_url)",
      shelter_id: `eq.${shelterId}`,
      ...(resolved === "true" ? { is_resolved: "eq.true" } : {}),
      ...(resolved === "false" ? { is_resolved: "eq.false" } : {}),
      order: "created_at.desc",
    },
  })

  return apiSuccess({
    items: records.map(mapHealthAlert),
  })
})
