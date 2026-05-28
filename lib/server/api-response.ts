import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { ApiError, isApiError } from "@/lib/server/api-errors"

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init
  )
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: details ?? null,
      },
    },
    { status }
  )
}

export function handleApiError(error: unknown) {
  if (isApiError(error)) {
    return apiError(error.status, error.code, error.message, error.details)
  }

  if (error instanceof ZodError) {
    return apiError(400, "VALIDATION_ERROR", "Invalid request data.", error.flatten())
  }

  console.error(error)
  return apiError(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.")
}

export function withRouteHandler<T extends (...args: any[]) => Promise<Response>>(handler: T) {
  return async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export function assertNonEmptyPatch(payload: Record<string, unknown>) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "EMPTY_PATCH", "At least one field must be provided.")
  }
}
