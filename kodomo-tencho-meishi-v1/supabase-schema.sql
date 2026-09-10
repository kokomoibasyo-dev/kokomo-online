-- 子ども店長名刺帳 v0.2 / Supabase schema
-- Supabase SQL Editor で一度だけ実行する想定。
-- 公開URLはカードの閲覧のみ。編集は x-card-edit-token ヘッダーの秘密キーで制御する。

create extension if not exists pgcrypto;

create table if not exists public.kodomo_tencho_cards (
  public_id text primary key,
  status text not null default 'draft' check (status in ('draft','active','disabled')),
  name text not null default '',
  shop text not null default '',
  emoji text not null default '✨',
  message text not null default '',
  tags text[] not null default array[]::text[],
  theme text not null default 'mint',
  image_data text,
  challenges jsonb not null default '[]'::jsonb,
  edit_token_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.kodomo_tencho_cards enable row level security;

revoke all on public.kodomo_tencho_cards from anon, authenticated;
grant select (public_id,status,name,shop,emoji,message,tags,theme,image_data,challenges,updated_at)
  on public.kodomo_tencho_cards to anon, authenticated;
grant update (status,name,shop,emoji,message,tags,theme,image_data,challenges)
  on public.kodomo_tencho_cards to anon, authenticated;

drop policy if exists "public can read non-disabled cards" on public.kodomo_tencho_cards;
create policy "public can read non-disabled cards"
on public.kodomo_tencho_cards
for select
to anon, authenticated
using (status <> 'disabled');

drop policy if exists "edit token can update its card" on public.kodomo_tencho_cards;
create policy "edit token can update its card"
on public.kodomo_tencho_cards
for update
to anon, authenticated
using (
  encode(
    digest(
      coalesce(current_setting('request.headers', true)::jsonb ->> 'x-card-edit-token', ''),
      'sha256'
    ),
    'hex'
  ) = edit_token_hash
)
with check (
  encode(
    digest(
      coalesce(current_setting('request.headers', true)::jsonb ->> 'x-card-edit-token', ''),
      'sha256'
    ),
    'hex'
  ) = edit_token_hash
);

create or replace function public.kodomo_tencho_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kodomo_tencho_touch_updated_at on public.kodomo_tencho_cards;
create trigger kodomo_tencho_touch_updated_at
before update on public.kodomo_tencho_cards
for each row execute function public.kodomo_tencho_touch_updated_at();

insert into public.kodomo_tencho_cards
(public_id,status,name,shop,emoji,message,tags,theme,image_data,challenges,edit_token_hash)
values
  ('AtYP8G1n2b', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, '1112bcf8fc463da8066cad24e2241851668b629366ef272533094c9b29b87993'),
  ('25525wLZdu', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, '929bff8a11975bc069a4145e9efa6fa00779def3986927bc5b438d4c1ba3b3e9'),
  ('EzfMPJhVEn', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, 'b1e056aa9cca173f4e1bc2f59c19d2eb9994cd8162ef72680df56b4a965ba496'),
  ('t0Rjr3laIB', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, '3ab96cc19c014136f45729139f387596fde78e88b067bdf3ff1bf620dd443913'),
  ('y6fxq432Ip', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, '23ab8964156a0883cea60e1befdb2ebaf7f9ccb07bbb317df9af810c250ad074'),
  ('Czk6l2bBrm', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, 'e966c5df3aff401956e35330316d54f510b2462b7288670915d1d1b190de917e'),
  ('YqsOH6FxJA', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, '19a2e5ea1ec83f0a18c354776f84ffa4cf03e7909375c96a8d4289402a42b656'),
  ('9ym5skJc15', 'draft', '', '', '✨', '', ARRAY[]::text[], 'mint', NULL, '[]'::jsonb, 'a0e4437ccef8fd50cecb2b50a0270f1372aa5a17e8595ed676ca6bc4c245a3bd')
on conflict (public_id) do nothing;
