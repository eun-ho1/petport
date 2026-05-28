create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create type public.user_role as enum ('admin', 'staff', 'volunteer');
create type public.dog_status as enum ('protected', 'treatment', 'temporary', 'adopted');
create type public.gender as enum ('male', 'female', 'unknown');
create type public.vaccination_status as enum ('complete', 'in_progress', 'not_started');
create type public.adoption_readiness as enum ('ready', 'missing_info', 'not_ready');
create type public.feeding_completion as enum ('complete', 'most', 'half', 'none', 'not_fed');
create type public.water_intake as enum ('enough', 'normal', 'low', 'none');
create type public.stool_condition as enum ('normal', 'soft', 'diarrhea', 'constipation', 'blood', 'unknown');
create type public.energy_level as enum ('very_active', 'active', 'normal', 'low', 'lethargic');
create type public.alert_priority as enum ('critical', 'high', 'medium', 'low');
create type public.alert_type as enum ('appetite_issue', 'vomiting', 'behavior_issue', 'medication_missed', 'weight_loss', 'general_health');
create type public.document_type as enum ('profile', 'vaccination', 'adoption', 'transport');
create type public.document_status as enum ('generated', 'draft', 'failed');

create table public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  phone text,
  email text,
  country_code text default 'KR',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  shelter_id uuid references public.shelters (id) on delete set null,
  full_name text,
  role public.user_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  name text not null,
  gender public.gender not null default 'unknown',
  estimated_age_text text,
  birth_date date,
  weight_kg numeric(5,2),
  breed text,
  rescue_date date,
  rescue_location text,
  is_neutered boolean not null default false,
  status public.dog_status not null default 'protected',
  vaccination_status public.vaccination_status not null default 'not_started',
  adoption_readiness public.adoption_readiness not null default 'missing_info',
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  personality text,
  rescue_story text,
  medical_notes text,
  primary_photo_url text,
  photo_urls text[] not null default '{}',
  missing_info text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  name text not null,
  administered_on date not null,
  next_due_on date,
  hospital_name text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.daily_care_records (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  care_date date not null,
  feeding_amount_grams integer,
  feeding_completion public.feeding_completion not null default 'not_fed',
  water_intake public.water_intake not null default 'normal',
  medication_given boolean not null default false,
  medication_notes text,
  stool_condition public.stool_condition not null default 'unknown',
  vomiting boolean not null default false,
  vomiting_notes text,
  energy_level public.energy_level not null default 'normal',
  aggression boolean not null default false,
  anxiety boolean not null default false,
  behavior_notes text,
  health_notes text,
  special_observations text,
  weight_kg numeric(5,2),
  temperature_c numeric(4,1),
  image_urls text[] not null default '{}',
  is_draft boolean not null default false,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (dog_id, care_date)
);

create table public.health_alerts (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  alert_type public.alert_type not null,
  priority public.alert_priority not null default 'medium',
  title text not null,
  description text,
  source_record_id uuid references public.daily_care_records (id) on delete set null,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.adoption_documents (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  document_type public.document_type not null,
  language_code text not null default 'en',
  title text not null,
  status public.document_status not null default 'generated',
  content_markdown text,
  file_url text,
  generated_by uuid references public.profiles (id) on delete set null,
  generated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_profiles_shelter_id on public.profiles (shelter_id);
create index idx_dogs_shelter_id on public.dogs (shelter_id);
create index idx_dogs_status on public.dogs (shelter_id, status);
create index idx_vaccinations_dog_id on public.vaccinations (dog_id, administered_on desc);
create index idx_daily_care_records_dog_date on public.daily_care_records (dog_id, care_date desc);
create index idx_daily_care_records_shelter_date on public.daily_care_records (shelter_id, care_date desc);
create index idx_health_alerts_dog_id on public.health_alerts (dog_id, is_resolved, created_at desc);
create index idx_health_alerts_shelter_id on public.health_alerts (shelter_id, is_resolved, priority);
create index idx_adoption_documents_dog_id on public.adoption_documents (dog_id, generated_at desc);

create or replace function public.sync_shelter_id()
returns trigger
language plpgsql
as $$
declare
  dog_shelter_id uuid;
begin
  if tg_table_name in ('vaccinations', 'daily_care_records', 'health_alerts', 'adoption_documents') then
    select shelter_id into dog_shelter_id
    from public.dogs
    where id = new.dog_id;

    if dog_shelter_id is null then
      raise exception 'dog_id % does not exist or has no shelter_id', new.dog_id;
    end if;

    new.shelter_id = dog_shelter_id;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger set_updated_at_shelters
before update on public.shelters
for each row execute function public.set_updated_at();

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_dogs
before update on public.dogs
for each row execute function public.set_updated_at();

create trigger set_updated_at_vaccinations
before update on public.vaccinations
for each row execute function public.set_updated_at();

create trigger set_updated_at_daily_care_records
before update on public.daily_care_records
for each row execute function public.set_updated_at();

create trigger set_updated_at_health_alerts
before update on public.health_alerts
for each row execute function public.set_updated_at();

create trigger set_updated_at_adoption_documents
before update on public.adoption_documents
for each row execute function public.set_updated_at();

create trigger sync_vaccinations_shelter_id
before insert or update on public.vaccinations
for each row execute function public.sync_shelter_id();

create trigger sync_daily_care_records_shelter_id
before insert or update on public.daily_care_records
for each row execute function public.sync_shelter_id();

create trigger sync_health_alerts_shelter_id
before insert or update on public.health_alerts
for each row execute function public.sync_shelter_id();

create trigger sync_adoption_documents_shelter_id
before insert or update on public.adoption_documents
for each row execute function public.sync_shelter_id();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.shelters enable row level security;
alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.vaccinations enable row level security;
alter table public.daily_care_records enable row level security;
alter table public.health_alerts enable row level security;
alter table public.adoption_documents enable row level security;

create policy "profiles_select_own_or_same_shelter"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or (
    shelter_id is not null
    and shelter_id in (
      select p.shelter_id
      from public.profiles p
      where p.id = auth.uid()
    )
  )
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "shelters_select_member"
on public.shelters
for select
to authenticated
using (
  id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

create policy "shelters_update_admin"
on public.shelters
for update
to authenticated
using (
  id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy "dogs_all_same_shelter"
on public.dogs
for all
to authenticated
using (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

create policy "vaccinations_all_same_shelter"
on public.vaccinations
for all
to authenticated
using (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

create policy "daily_care_records_all_same_shelter"
on public.daily_care_records
for all
to authenticated
using (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

create policy "health_alerts_all_same_shelter"
on public.health_alerts
for all
to authenticated
using (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

create policy "adoption_documents_all_same_shelter"
on public.adoption_documents
for all
to authenticated
using (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);
