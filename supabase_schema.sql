-- Create diagnoses table
create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  lang text,
  answers jsonb,
  qualitative_context text,
  state text,
  confidence int,
  label text,
  color text,
  one_liner text,
  dimensions jsonb,
  is_unlocked boolean default false,
  unlocked_at timestamptz,
  v3_insights jsonb
);

-- Enable Row Level Security (RLS)
alter table diagnoses enable row level security;

-- Policies
-- 1. Allow anyone (including anonymous) to insert a diagnosis
create policy "Anyone can insert a diagnosis" on diagnoses
  for insert with check (true);

-- 2. Allow anyone to view a diagnosis IF they have the ID (UUIDs are hard to guess)
-- OR if they are the owner
create policy "Anyone can view a diagnosis by ID" on diagnoses
  for select using (true);

-- 3. Allow users to update their own diagnoses
create policy "Users can update their own diagnoses" on diagnoses
  for update using (auth.uid() = user_id);

-- 4. Allow users to delete their own diagnoses
create policy "Users can delete their own diagnoses" on diagnoses
  for delete using (auth.uid() = user_id);
