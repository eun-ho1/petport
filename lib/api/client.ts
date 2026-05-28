import { getStoredSession, clearSession } from "@/lib/auth/session"
import type {
  AppSettings,
  DailyCareRecord,
  Dog,
  GeneratedDocument,
  HealthAlert,
} from "@/lib/types"

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiFailure {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export class ClientApiError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code = "CLIENT_API_ERROR", status = 500, details?: unknown) {
    super(message)
    this.name = "ClientApiError"
    this.code = code
    this.status = status
    this.details = details
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const session = typeof window !== "undefined" ? getStoredSession() : null

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload || !payload.success) {
    const message =
      payload && !payload.success
        ? payload.error.message
        : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."

    const code = payload && !payload.success ? payload.error.code : "HTTP_ERROR"
    const details = payload && !payload.success ? payload.error.details : undefined

    if (response.status === 401 && typeof window !== "undefined") {
      clearSession()
    }

    throw new ClientApiError(message, code, response.status, details)
  }

  return payload.data
}

function getAuthHeaders() {
  const session = typeof window !== "undefined" ? getStoredSession() : null
  return session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}
}

function parseDownloadFileName(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1])
  }

  const basicMatch = contentDisposition.match(/filename="([^"]+)"/i)
  if (basicMatch?.[1]) {
    return basicMatch[1]
  }

  return fallback
}

export const apiClient = {
  getDogs: () => request<{ items: Dog[] }>("/api/dogs"),
  getDog: (id: string) => request<{ item: Dog }>(`/api/dogs/${id}`),
  createDog: (body: unknown) =>
    request<{ item: Dog }>("/api/dogs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateDog: (id: string, body: unknown) =>
    request<{ item: Dog }>(`/api/dogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteDog: (id: string) =>
    request<{ deleted: boolean; id: string }>(`/api/dogs/${id}`, {
      method: "DELETE",
    }),
  getDailyCareRecords: (dogId: string) =>
    request<{ items: DailyCareRecord[] }>(`/api/dogs/${dogId}/daily-care`),
  createDailyCareRecord: (dogId: string, body: unknown) =>
    request<{ item: DailyCareRecord }>(`/api/dogs/${dogId}/daily-care`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getHealthAlerts: (resolved?: boolean) =>
    request<{ items: HealthAlert[] }>(
      resolved === undefined
        ? "/api/health-alerts"
        : `/api/health-alerts?resolved=${String(resolved)}`
    ),
  resolveHealthAlert: (id: string) =>
    request<{ item: HealthAlert }>(`/api/health-alerts/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({}),
    }),
  createDocument: (dogId: string, body: unknown) =>
    request<{ item: GeneratedDocument }>(`/api/dogs/${dogId}/documents`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSettings: () => request<AppSettings>("/api/settings"),
  updateSettings: (body: unknown) =>
    request<AppSettings>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  downloadDocument: async (id: string, format: "md" | "docx" = "md") => {
    const response = await fetch(`/api/documents/${id}/download?format=${format}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiFailure | null
      throw new ClientApiError(
        payload?.error.message ?? "다운로드에 실패했습니다.",
        payload?.error.code ?? "DOWNLOAD_ERROR",
        response.status,
        payload?.error.details
      )
    }

    const blob = await response.blob()
    const fileName = parseDownloadFileName(
      response.headers.get("content-disposition"),
      `document.${format}`
    )

    const blobUrl = window.URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = blobUrl
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.URL.revokeObjectURL(blobUrl)
  },
  getDocumentDownloadUrl: (id: string, format: "md" | "docx" = "md") =>
    `/api/documents/${id}/download?format=${format}`,
}
