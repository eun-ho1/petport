create table if not exists public.shelter_settings (
  shelter_id uuid primary key references public.shelters (id) on delete cascade,
  document_default_language text not null default 'en',
  document_include_shelter_info boolean not null default true,
  document_include_contact_info boolean not null default true,
  document_include_timestamp boolean not null default true,
  document_custom_footer text,
  appetite_alert_on_half_feeding boolean not null default true,
  appetite_alert_on_no_feeding boolean not null default true,
  low_water_alert_enabled boolean not null default true,
  low_energy_alert_enabled boolean not null default true,
  behavior_alert_enabled boolean not null default true,
  vomiting_alert_priority public.alert_priority not null default 'critical',
  general_health_alert_priority public.alert_priority not null default 'medium',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_settings (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  shelter_id uuid not null references public.shelters (id) on delete cascade,
  auto_translate boolean not null default true,
  include_emoji boolean not null default false,
  formal_tone boolean not null default true,
  include_disclaimer boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profile_settings_shelter_id
on public.profile_settings (shelter_id);

create or replace function public.sync_profile_settings_shelter_id()
returns trigger
language plpgsql
as $$
declare
  profile_shelter_id uuid;
begin
  select shelter_id into profile_shelter_id
  from public.profiles
  where id = new.profile_id;

  if profile_shelter_id is null then
    raise exception 'profile_id % does not exist or has no shelter_id', new.profile_id;
  end if;

  new.shelter_id = profile_shelter_id;
  return new;
end;
$$;

create trigger set_updated_at_shelter_settings
before update on public.shelter_settings
for each row execute function public.set_updated_at();

create trigger set_updated_at_profile_settings
before update on public.profile_settings
for each row execute function public.set_updated_at();

create trigger sync_profile_settings_shelter_id
before insert or update on public.profile_settings
for each row execute function public.sync_profile_settings_shelter_id();

alter table public.shelter_settings enable row level security;
alter table public.profile_settings enable row level security;

create policy "shelter_settings_all_same_shelter"
on public.shelter_settings
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

create policy "profile_settings_select_own_or_same_shelter"
on public.profile_settings
for select
to authenticated
using (
  profile_id = auth.uid()
  or shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

create policy "profile_settings_upsert_own_or_same_shelter"
on public.profile_settings
for all
to authenticated
using (
  profile_id = auth.uid()
  or shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  profile_id = auth.uid()
  or shelter_id in (
    select p.shelter_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);
