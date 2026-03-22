-- Supa-Fleet schema
-- Run this in your Supabase project's SQL editor.

create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- 1. vehicles: latest snapshot per device
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  device_id text not null unique,
  last_lat double precision not null,
  last_lng double precision not null,
  current_status text not null check (current_status in ('far', 'near', 'immediate')),
  last_ping timestamptz not null default timezone('utc'::text, now()),
  nickname text
);

-- 2. location_logs: historical trail for each vehicle
create table if not exists public.location_logs (
  id bigserial primary key,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  location geography(Point, 4326) not null,
  speed double precision,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for performance on large history table
create index if not exists idx_location_logs_created_at on public.location_logs (created_at);
create index if not exists idx_location_logs_vehicle_id on public.location_logs (vehicle_id);
create index if not exists idx_location_logs_location on public.location_logs using gist (location);

-- Enable Realtime for live tracking
alter publication supabase_realtime add table public.vehicles;
alter publication supabase_realtime add table public.location_logs;

-- Stored procedure to atomically update vehicles snapshot and append to location_logs
create or replace function public.update_vehicle_location(
  p_device_id text,
  p_lat double precision,
  p_lng double precision,
  p_status text,
  p_speed double precision default null,
  p_nickname text default null
)
returns public.vehicles
language plpgsql
security definer
as $$
declare
  v_vehicle public.vehicles;
begin
  -- Upsert latest snapshot for this device
  insert into public.vehicles (device_id, last_lat, last_lng, current_status, last_ping, nickname)
  values (p_device_id, p_lat, p_lng, p_status, timezone('utc'::text, now()), p_nickname)
  on conflict (device_id) do update
    set last_lat = excluded.last_lat,
        last_lng = excluded.last_lng,
        current_status = excluded.current_status,
        last_ping = excluded.last_ping,
        nickname = coalesce(excluded.nickname, public.vehicles.nickname)
  returning * into v_vehicle;

  -- Append to historical trail using PostGIS geography
  insert into public.location_logs (vehicle_id, location, speed)
  values (
    v_vehicle.id,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_speed
  );

  return v_vehicle;
end;
$$;
