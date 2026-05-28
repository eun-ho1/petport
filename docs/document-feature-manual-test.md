# Document Feature Manual Test

## Preconditions

- Supabase migration and seed have been applied.
- `.env.local` contains valid `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEFAULT_SHELTER_ID`.
- Next.js dev server is running.
- At least one dog exists with vaccination and daily care data.

## Test Flow

1. Open `/documents`.
2. Select a dog.
3. Select a document type such as `Adoption Information Sheet`.
4. Generate once in `English`.
5. Confirm the preview includes:
   - dog basic information
   - vaccination summary
   - health summary
   - recent daily care highlights
6. Click `Markdown 다운로드`.
7. Open the downloaded `.md` file and verify UTF-8 text renders correctly.
8. Click `DOCX 다운로드`.
9. Open the downloaded `.docx` file in Word, LibreOffice, or Google Docs import and verify it opens normally.
10. In Supabase, check `public.adoption_documents` and confirm:
    - a new row exists
    - `status = generated`
    - `content_markdown` is populated
    - `language_code` matches the selected language
11. Repeat with `한국어` selected and verify Korean text displays correctly in preview and in both downloaded files.

## Failure Handling

1. Temporarily break Supabase access or stop the Next.js server.
2. Try to generate a document.
3. Confirm the UI shows a friendly error message.
4. Confirm a failed history row is stored in `public.adoption_documents` with `status = failed` when the API can still reach the database but generation fails.

## Download File Name Rule

Expected pattern:

- Markdown: `pawbridge_<dog-name>_<document-type>_<language>_<yyyymmdd>.md`
- DOCX: `pawbridge_<dog-name>_<document-type>_<language>_<yyyymmdd>.docx`
