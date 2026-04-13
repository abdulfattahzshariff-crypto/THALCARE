-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- Transfusions table
create table if not exists transfusions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  pints       smallint not null default 2,
  hb_level    numeric(4,1),
  notes       text,
  created_at  timestamptz default now()
);

-- Medication logs table
create table if not exists medication_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  taken       boolean not null default false,
  created_at  timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security: each user can only see their own data
alter table transfusions     enable row level security;
alter table medication_logs  enable row level security;

create policy "Users see own transfusions"
  on transfusions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see own medication logs"
  on medication_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_transfusions_user_date
  on transfusions(user_id, date desc);

create index if not exists idx_medication_logs_user_date
  on medication_logs(user_id, date desc);
