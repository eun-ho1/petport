insert into public.shelters (
  id,
  name,
  description,
  address,
  phone,
  email,
  country_code
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Love Paws Shelter',
    'Rescue and overseas adoption focused shelter.',
    '123 Gangseo-daero, Seoul',
    '02-1234-5678',
    'contact@lovepaws.kr',
    'KR'
  )
on conflict (id) do nothing;

insert into public.dogs (
  id,
  shelter_id,
  name,
  gender,
  estimated_age_text,
  weight_kg,
  breed,
  rescue_date,
  rescue_location,
  is_neutered,
  status,
  vaccination_status,
  adoption_readiness,
  readiness_score,
  personality,
  rescue_story,
  medical_notes,
  primary_photo_url,
  photo_urls,
  missing_info
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Choco',
    'male',
    '2 years',
    8.5,
    'Mixed',
    '2024-01-15',
    'Gangnam-gu, Seoul',
    true,
    'protected',
    'complete',
    'ready',
    95,
    'Friendly and social. Loves people and gets along with other dogs.',
    'Rescued from an alley in Seoul and recovered well after initial treatment.',
    'Generally healthy. Needs routine follow-up checks.',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    array[
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'
    ],
    array[]::text[]
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Mongi',
    'female',
    '3 years',
    5.2,
    'Maltese',
    '2024-02-10',
    'Suwon, Gyeonggi-do',
    true,
    'protected',
    'in_progress',
    'missing_info',
    68,
    'Quiet at first but affectionate once comfortable.',
    'Rescued after abandonment and now recovering steadily.',
    'Mild skin sensitivity. Monitor stress closely.',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop',
    array[
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop'
    ],
    array['extra photos', 'rabies vaccination']
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Bori',
    'male',
    '1 year',
    12.3,
    'Jindo mix',
    '2024-03-01',
    'Cheonan, Chungnam',
    false,
    'treatment',
    'not_started',
    'not_ready',
    32,
    'Needs time to build trust and confidence.',
    'Found injured near a roadside and is currently in recovery.',
    'Leg surgery recovery in progress. Requires close monitoring.',
    'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop',
    array[
      'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop'
    ],
    array['all vaccinations', 'neuter surgery', 'temperament assessment']
  )
on conflict (id) do nothing;

insert into public.vaccinations (
  id,
  shelter_id,
  dog_id,
  name,
  administered_on,
  next_due_on,
  hospital_name,
  notes
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'DHPPL',
    '2024-01-20',
    '2025-01-20',
    'Happy Animal Hospital',
    'Initial combination vaccine'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Rabies',
    '2024-01-20',
    '2025-01-20',
    'Happy Animal Hospital',
    null
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'DHPPL',
    '2024-02-15',
    '2025-02-15',
    'Seoul Vet Clinic',
    'First recorded shot'
  )
on conflict (id) do nothing;

insert into public.daily_care_records (
  id,
  shelter_id,
  dog_id,
  care_date,
  feeding_amount_grams,
  feeding_completion,
  water_intake,
  medication_given,
  stool_condition,
  vomiting,
  energy_level,
  aggression,
  anxiety,
  behavior_notes,
  health_notes,
  weight_kg,
  temperature_c,
  is_draft
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    current_date,
    200,
    'complete',
    'enough',
    false,
    'normal',
    false,
    'active',
    false,
    false,
    'Played well with staff and other dogs.',
    'No issues observed.',
    8.5,
    38.2,
    false
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    current_date,
    120,
    'half',
    'low',
    true,
    'soft',
    true,
    'low',
    false,
    true,
    'Showed anxiety during cleaning.',
    'Vomiting once after medication.',
    12.0,
    39.1,
    false
  )
on conflict (dog_id, care_date) do nothing;

insert into public.health_alerts (
  id,
  shelter_id,
  dog_id,
  alert_type,
  priority,
  title,
  description,
  source_record_id,
  is_resolved
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'vomiting',
    'critical',
    'Vomiting observed during daily care',
    'Dog vomited after medication and showed low energy.',
    '44444444-4444-4444-4444-444444444442',
    false
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'general_health',
    'medium',
    'Skin condition follow-up',
    'Monitor allergy symptoms and skin irritation.',
    null,
    true
  )
on conflict (id) do nothing;

insert into public.adoption_documents (
  id,
  shelter_id,
  dog_id,
  document_type,
  language_code,
  title,
  status,
  content_markdown,
  generated_at
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'profile',
    'en',
    'Choco English Profile',
    'generated',
    '# Choco Profile',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'vaccination',
    'en',
    'Choco Vaccination Summary',
    'generated',
    '# Vaccination Summary',
    timezone('utc', now()) - interval '1 day'
  )
on conflict (id) do nothing;

-- After a real user signs up, connect that profile to the shelter:
-- update public.profiles
-- set shelter_id = '11111111-1111-1111-1111-111111111111',
--     full_name = 'Shelter Admin',
--     role = 'admin'
-- where id = auth.uid();
