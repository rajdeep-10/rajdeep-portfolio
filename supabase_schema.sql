-- ════════════════════════════════════════════════════════════════
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════

-- 1. Generic key/value content table
--    Every editable widget on the site (THM stats, HTB stats, timeline,
--    write-ups, etc.) stores its JSON under a unique key here.
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table site_content enable row level security;

-- Anyone (including logged-out visitors) can READ content
create policy "Public can read site content"
  on site_content for select
  using (true);

-- Only logged-in users (i.e. you, the only account) can WRITE
create policy "Authenticated users can insert site content"
  on site_content for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update site content"
  on site_content for update
  to authenticated
  using (true);

create policy "Authenticated users can delete site content"
  on site_content for delete
  to authenticated
  using (true);

-- Enable realtime so edits push live to all open visitor tabs
alter publication supabase_realtime add table site_content;


-- ════════════════════════════════════════════════════════════════
-- 2. Storage bucket for CV (created via SQL, but you can also do
--    this by hand in Dashboard → Storage → New Bucket → name "cv" → Public)
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('cv', 'cv', true)
on conflict (id) do nothing;

-- Public can read/download the CV
create policy "Public can read CV"
  on storage.objects for select
  using (bucket_id = 'cv');

-- Only logged-in users can upload/replace the CV
create policy "Authenticated users can upload CV"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cv');

create policy "Authenticated users can update CV"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cv');
