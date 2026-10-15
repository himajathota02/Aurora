-- AURORA public content tables. Apply this in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.songs (
  id text primary key default gen_random_uuid()::text,
  title text not null check (char_length(title) between 1 and 100),
  artist text not null check (char_length(artist) between 1 and 100),
  audio_url text not null,
  storage_path text not null,
  file_name text not null,
  -- Nullable legacy fields keep an existing installation migratable; AURORA no longer reads or writes them.
  youtube_url text,
  youtube_video_id text,
  cover_image_url text,
  note text check (note is null or char_length(note) <= 240),
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate an existing AURORA installation from URL-based tracks to uploaded audio.
alter table public.songs add column if not exists audio_url text;
alter table public.songs add column if not exists storage_path text;
alter table public.songs add column if not exists file_name text;
alter table public.songs alter column youtube_url drop not null;
alter table public.songs alter column youtube_video_id drop not null;

create table if not exists public.affirmations (
  id text primary key default gen_random_uuid()::text,
  message text not null check (char_length(message) between 1 and 240),
  supporting_text text check (supporting_text is null or char_length(supporting_text) <= 180),
  category text not null default 'Hope' check (char_length(category) <= 40),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.aurora_is_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.songs enable row level security;
alter table public.affirmations enable row level security;

drop policy if exists "Public reads active songs" on public.songs;
create policy "Public reads active songs" on public.songs
  for select to anon, authenticated using (is_active = true);
drop policy if exists "Admins manage songs" on public.songs;
create policy "Admins manage songs" on public.songs
  for all to authenticated using (public.aurora_is_admin()) with check (public.aurora_is_admin());

drop policy if exists "Public reads active affirmations" on public.affirmations;
create policy "Public reads active affirmations" on public.affirmations
  for select to anon, authenticated using (is_active = true);
drop policy if exists "Admins manage affirmations" on public.affirmations;
create policy "Admins manage affirmations" on public.affirmations
  for all to authenticated using (public.aurora_is_admin()) with check (public.aurora_is_admin());

grant select on public.songs, public.affirmations to anon, authenticated;
grant insert, update, delete on public.songs, public.affirmations to authenticated;

-- Public streaming bucket; only an authenticated AURORA administrator may upload or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aurora-songs', 'aurora-songs', true, 104857600, array['audio/mpeg','audio/mp4','audio/aac','audio/wav','audio/x-wav','audio/ogg','audio/webm','audio/flac','audio/x-m4a'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads AURORA audio" on storage.objects;
create policy "Public reads AURORA audio" on storage.objects
  for select to anon, authenticated using (bucket_id = 'aurora-songs');
drop policy if exists "AURORA admins upload audio" on storage.objects;
create policy "AURORA admins upload audio" on storage.objects
  for insert to authenticated with check (bucket_id = 'aurora-songs' and public.aurora_is_admin());
drop policy if exists "AURORA admins delete audio" on storage.objects;
create policy "AURORA admins delete audio" on storage.objects
  for delete to authenticated using (bucket_id = 'aurora-songs' and public.aurora_is_admin());

-- Serialize concurrent changes so the active catalogue cannot exceed 50 tracks.
create or replace function public.aurora_enforce_active_song_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_active then
    perform pg_advisory_xact_lock(704931, 1);
    if (select count(*) from public.songs s where s.is_active and s.id <> new.id) >= 50 then
      raise exception 'AURORA supports at most 50 active songs.' using errcode = 'check_violation';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aurora_active_song_limit on public.songs;
create trigger aurora_active_song_limit
  before insert or update on public.songs
  for each row execute function public.aurora_enforce_active_song_limit();

create or replace function public.aurora_touch_affirmation()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists aurora_touch_affirmation on public.affirmations;
create trigger aurora_touch_affirmation before update on public.affirmations
  for each row execute function public.aurora_touch_affirmation();
