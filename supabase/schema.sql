create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists public.routes (
  id text primary key,
  name text not null unique,
  travel_time integer not null check (travel_time > 0),
  load_time integer not null check (load_time >= 0),
  unload_time integer not null check (unload_time >= 0),
  distance_km numeric(10,2) default 0,
  base_capacity numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  label text not null unique,
  type text not null check (type in ('own', 'agency', 'oncall')),
  capacity numeric(10,2) not null check (capacity > 0),
  available_at timestamptz not null default now(),
  status text not null default 'available' check (status in ('available', 'assigned', 'running', 'idle', 'maintenance')),
  current_route text references public.routes(id) on delete set null,
  last_known_location numeric(5,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  route_id text not null references public.routes(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity numeric(10,2) not null check (capacity > 0),
  used_capacity numeric(10,2) not null default 0 check (used_capacity >= 0),
  status text not null default 'planned' check (status in ('planned', 'running', 'delayed', 'completed')),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  created_at timestamptz default now(),
  constraint trips_capacity_chk check (used_capacity <= capacity),
  constraint trips_time_chk check (end_time > start_time)
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  route_id text not null references public.routes(id) on delete cascade,
  weight numeric(10,2) not null check (weight > 0),
  deadline timestamptz not null,
  source text not null check (source in ('manual', 'csv', 'api')),
  trip_id uuid references public.trips(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.trip_orders (
  trip_id uuid not null references public.trips(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (trip_id, order_id)
);

alter table public.users enable row level security;
alter table public.routes enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.orders enable row level security;
alter table public.trip_orders enable row level security;

create policy "authenticated users can read users" on public.users
for select to authenticated using (true);

create policy "authenticated users can manage their profile" on public.users
for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "authenticated users can read routes" on public.routes
for select to authenticated using (true);

create policy "authenticated users can manage routes" on public.routes
for all to authenticated using (true) with check (true);

create policy "authenticated users can read vehicles" on public.vehicles
for select to authenticated using (true);

create policy "authenticated users can manage vehicles" on public.vehicles
for all to authenticated using (true) with check (true);

create policy "authenticated users can read trips" on public.trips
for select to authenticated using (true);

create policy "authenticated users can manage trips" on public.trips
for all to authenticated using (true) with check (true);

create policy "authenticated users can read orders" on public.orders
for select to authenticated using (true);

create policy "authenticated users can manage orders" on public.orders
for all to authenticated using (true) with check (true);

create policy "authenticated users can read trip_orders" on public.trip_orders
for select to authenticated using (true);

create policy "authenticated users can manage trip_orders" on public.trip_orders
for all to authenticated using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.routes (id, name, travel_time, load_time, unload_time, distance_km, base_capacity)
values
  ('route-mumbai-pune', 'Mumbai -> Pune', 220, 35, 30, 154, 18),
  ('route-delhi-jaipur', 'Delhi -> Jaipur', 290, 40, 35, 281, 22),
  ('route-bengaluru-chennai', 'Bengaluru -> Chennai', 360, 45, 40, 347, 24)
on conflict (id) do nothing;

-- Enable Real-time for all operational tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.vehicles;
alter publication supabase_realtime add table public.routes;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.trips;

-- Migration: Add vehicle driver details and route validity dates
alter table public.vehicles add column if not exists registration_number text;
alter table public.vehicles add column if not exists driver_name text;
alter table public.vehicles add column if not exists driver_phone text;

alter table public.routes add column if not exists start_date timestamptz;
alter table public.routes add column if not exists end_date timestamptz;
