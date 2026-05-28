# Shelter MVP API Manual Test

The project exposes the requested APIs under the Next.js API prefix:

- `GET /api/dogs`
- `POST /api/dogs`
- `GET /api/dogs/:id`
- `PATCH /api/dogs/:id`
- `DELETE /api/dogs/:id`
- `GET /api/dogs/:id/daily-care`
- `POST /api/dogs/:id/daily-care`
- `GET /api/health-alerts`
- `PATCH /api/health-alerts/:id/resolve`
- `POST /api/dogs/:id/documents`
- `GET /api/documents/:id/download`

## Required headers

All requests need shelter context.

```http
x-shelter-id: 11111111-1111-1111-1111-111111111111
```

If you do not send it, the API falls back to `DEFAULT_SHELTER_ID` from `.env.local`.

## Setup

1. Create `.env.local` from `.env.example`
2. Fill in `NEXT_PUBLIC_SUPABASE_URL`
3. Fill in `SUPABASE_SERVICE_ROLE_KEY`
4. Optionally set `DEFAULT_SHELTER_ID`
5. Apply the migration and seed SQL
6. Start the app with `pnpm dev` or `npm run dev`

## Quick smoke tests

### 1. List dogs

```bash
curl -X GET "http://localhost:3000/api/dogs" ^
  -H "x-shelter-id: 11111111-1111-1111-1111-111111111111"
```

### 2. Create a dog

```bash
curl -X POST "http://localhost:3000/api/dogs" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -H "x-shelter-id: 11111111-1111-1111-1111-111111111111" ^
  -d "{\"name\":\"Coco\",\"gender\":\"female\",\"estimatedAge\":\"2 years\",\"weight\":7.4,\"breed\":\"Mixed\",\"status\":\"protected\",\"vaccinationStatus\":\"in_progress\",\"adoptionReadiness\":\"missing_info\",\"photos\":[\"https://example.com/coco-1.jpg\"],\"vaccinations\":[{\"name\":\"DHPPL\",\"date\":\"2026-05-27\"}]}"
```

### 3. Add daily care record

```bash
curl -X POST "http://localhost:3000/api/dogs/<DOG_ID>/daily-care" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -H "x-shelter-id: 11111111-1111-1111-1111-111111111111" ^
  -d "{\"date\":\"2026-05-27\",\"feedingAmount\":180,\"feedingCompletion\":\"complete\",\"waterIntake\":\"normal\",\"medicationGiven\":false,\"stoolCondition\":\"normal\",\"vomiting\":false,\"energyLevel\":\"active\",\"aggression\":false,\"anxiety\":false,\"isDraft\":false}"
```

### 4. Generate document

```bash
curl -X POST "http://localhost:3000/api/dogs/<DOG_ID>/documents" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -H "x-shelter-id: 11111111-1111-1111-1111-111111111111" ^
  -d "{\"documentType\":\"profile\",\"languageCode\":\"en\"}"
```

### 5. Resolve health alert

```bash
curl -X PATCH "http://localhost:3000/api/health-alerts/<ALERT_ID>/resolve" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -H "x-shelter-id: 11111111-1111-1111-1111-111111111111" ^
  -d "{}"
```

## Unified error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {}
  }
}
```

## Unified success response

```json
{
  "success": true,
  "data": {}
}
```
