# Auth and Shelter Isolation Manual Test

## Preconditions

- `.env.local` contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- At least two shelters exist.
- At least one authenticated user profile exists for each shelter.
- Each user has `profiles.shelter_id` assigned.

## Web Login Flow

1. Open `/login`.
2. Sign in with a user from shelter A.
3. Confirm the dashboard opens normally.
4. Open `/dogs`, `/daily-care/alerts`, `/documents`, `/settings`.
5. Confirm only shelter A data is visible.

## Shelter Isolation Check

1. Copy a dog ID that belongs to shelter B.
2. While logged in as shelter A, call:

```bash
curl http://localhost:3000/api/dogs/<dog-id> \
  -H "Authorization: Bearer <shelter-a-access-token>"
```

3. Confirm the API returns `404 DOG_NOT_FOUND` or otherwise denies access.

4. Call the dogs list endpoint:

```bash
curl http://localhost:3000/api/dogs \
  -H "Authorization: Bearer <shelter-a-access-token>"
```

5. Confirm only shelter A dogs are returned.

## Direct API Access Protection

1. Remove the `Authorization` header and call any protected API.
2. Confirm the API returns `401 UNAUTHORIZED`.

3. Use an expired or invalid token.
4. Confirm the API returns `401 INVALID_ACCESS_TOKEN`.

## Settings Isolation Check

1. Log in as shelter A and change `/settings`.
2. Log out.
3. Log in as shelter B.
4. Confirm shelter A settings are not visible or editable through shelter B.

## RLS Check in Supabase

If you query Supabase directly with an authenticated user token instead of the service role:

- `dogs`, `daily_care_records`, `health_alerts`, `adoption_documents`, `shelter_settings`, and `profile_settings`
  should only return rows for the authenticated user's shelter.
