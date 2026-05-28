# Settings Feature Manual Test

## Preconditions

- Supabase migrations have been applied, including `20260528_000002_settings.sql`.
- `.env.local` contains valid Supabase values and `DEFAULT_SHELTER_ID`.
- Next.js dev server is running.

## Test Flow

1. Open `/settings`.
2. In `보호소 정보`:
   - change shelter name, phone, address, email, or description
   - click `보호소 정보 저장`
3. Refresh the page.
4. Confirm the saved values remain visible.

5. In `문서 기본값`:
   - change default language
   - toggle shelter/contact/timestamp options
   - edit custom footer
   - click `문서 기본값 저장`
6. Refresh the page.
7. Confirm the changed values remain visible.

8. In `알림 기준`:
   - toggle appetite, water, energy, and behavior alert switches
   - change vomiting and general health priorities
   - click `알림 기준 저장`
9. Refresh the page.
10. Confirm the changed values remain visible.

11. In `AI 설정`:
   - toggle auto translate, formal tone, emoji, and disclaimer
   - click `AI 설정 저장`
12. Refresh the page.
13. Confirm the changed values remain visible.

## Database Checks

Verify in Supabase:

- `public.shelters` contains the updated shelter profile values.
- `public.shelter_settings` contains document defaults and alert settings for the current `shelter_id`.
- `public.profile_settings` contains AI settings for the resolved `profile_id`.

## Expected UX

- Successful save shows a success toast.
- Failed save shows a destructive toast and an inline error alert.
- Refreshing the page should load the last saved values from the database.
