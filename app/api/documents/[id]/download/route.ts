import { ApiError } from "@/lib/server/api-errors"
import { withRouteHandler } from "@/lib/server/api-response"
import { buildDocxFromMarkdown } from "@/lib/server/docx"
import { getRequestContext } from "@/lib/server/request-context"
import { supabaseRequest } from "@/lib/server/supabase-rest"

function normalizeFormat(value: string | null) {
  return value === "docx" ? "docx" : "md"
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
}

function encodeFileName(value: string) {
  return encodeURIComponent(value).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
}

function buildDownloadFileName(documentRecord: {
  title: string
  document_type: string
  language_code: string
  generated_at?: string | null
  dogs?: { name?: string | null } | null
}) {
  const dogName = documentRecord.dogs?.name?.trim() || "dog"
  const generatedAt = (documentRecord.generated_at ?? "").slice(0, 10).replaceAll("-", "") || "document"
  const baseName = `pawbridge_${slugify(dogName) || "dog"}_${documentRecord.document_type}_${documentRecord.language_code}_${generatedAt}`

  return {
    unicode: `${dogName}_${documentRecord.document_type}_${generatedAt}`,
    ascii: baseName,
  }
}

export const GET = withRouteHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { shelterId } = await getRequestContext(request)
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = normalizeFormat(searchParams.get("format"))

  const records = await supabaseRequest<any[]>("adoption_documents", {
    query: {
      select:
        "id,title,content_markdown,file_url,language_code,document_type,shelter_id,generated_at,dogs(name)",
      id: `eq.${id}`,
      shelter_id: `eq.${shelterId}`,
      limit: 1,
    },
  })

  const documentRecord = records[0]

  if (!documentRecord) {
    throw new ApiError(404, "DOCUMENT_NOT_FOUND", "Document not found.")
  }

  if (documentRecord.file_url) {
    return Response.redirect(documentRecord.file_url, 302)
  }

  const fileName = buildDownloadFileName(documentRecord)

  if (format === "docx") {
    const documentBuffer = buildDocxFromMarkdown(documentRecord.title, documentRecord.content_markdown ?? "")

    return new Response(documentBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName.ascii}.docx"; filename*=UTF-8''${encodeFileName(`${fileName.unicode}.docx`)}`,
      },
    })
  }

  return new Response(documentRecord.content_markdown ?? "", {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName.ascii}.md"; filename*=UTF-8''${encodeFileName(`${fileName.unicode}.md`)}`,
    },
  })
})
