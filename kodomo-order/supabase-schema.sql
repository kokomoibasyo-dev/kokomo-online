-- こどもオーダー：複数端末同期用 Supabase スキーマ
-- Supabase SQL Editor に、このファイル全体を貼り付けて実行してください。
-- 決済情報・個人情報は扱わない想定です。

create extension if not exists pgcrypto;

create table if not exists public.ko_shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  secret_hash text not null unique,
  next_order_no integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.ko_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.ko_shops(id) on delete cascade,
  name text not null,
  price integer not null default 0 check (price >= 0),
  emoji text not null default '🍽️',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ko_orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.ko_shops(id) on delete cascade,
  order_no integer not null,
  client_id text not null default '',
  status text not null check (status in ('received','cooking','ready','served')),
  total integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(shop_id, order_no)
);
create index if not exists ko_orders_shop_created_idx on public.ko_orders(shop_id, created_at desc);

-- テーブル直接アクセスは不可。以下のRPC関数だけをanonから呼べるようにします。
alter table public.ko_shops enable row level security;
alter table public.ko_products enable row level security;
alter table public.ko_orders enable row level security;
revoke all on public.ko_shops from anon, authenticated;
revoke all on public.ko_products from anon, authenticated;
revoke all on public.ko_orders from anon, authenticated;

create or replace function public.ko_secret_hash(p_secret text)
returns text language sql immutable as $$
  select encode(digest(coalesce(p_secret,''), 'sha256'), 'hex');
$$;

drop function if exists public.create_shop(text,text);

create or replace function public.create_shop(p_name text, p_secret text, p_products jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_id uuid; v_count integer;
begin
  if length(coalesce(p_secret,'')) < 16 then raise exception '共有コードが短すぎます'; end if;
  insert into public.ko_shops(name, secret_hash) values (coalesce(nullif(trim(p_name),''),'こどものお店'), public.ko_secret_hash(p_secret)) returning id into v_id;

  insert into public.ko_products(shop_id,name,price,emoji,sort_order,active)
  select v_id,
         coalesce(nullif(trim(x.name),''),'商品'),
         greatest(coalesce(x.price,0),0),
         coalesce(nullif(x.emoji,''),'🍽️'),
         coalesce(x.sort_order,0),
         coalesce(x.active,true)
  from jsonb_to_recordset(coalesce(p_products,'[]'::jsonb)) as x(name text, price integer, emoji text, sort_order integer, active boolean);

  get diagnostics v_count = row_count;
  if v_count = 0 then
    insert into public.ko_products(shop_id,name,price,emoji,sort_order) values
      (v_id,'カレー',300,'🍛',1),(v_id,'ジュース',100,'🥤',2),(v_id,'ケーキ',200,'🍰',3),
      (v_id,'ポテト',150,'🍟',4),(v_id,'パンケーキ',250,'🥞',5),(v_id,'アイス',120,'🍨',6);
  end if;
  return jsonb_build_object('shop_id',v_id);
end $$;

create or replace function public.ko_shop_id(p_secret text)
returns uuid language sql stable security definer set search_path = public
as $$ select id from public.ko_shops where secret_hash = public.ko_secret_hash(p_secret) limit 1 $$;

create or replace function public.get_shop_state(p_secret text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_shop public.ko_shops%rowtype; v_products jsonb; v_orders jsonb;
begin
  select * into v_shop from public.ko_shops where secret_hash = public.ko_secret_hash(p_secret);
  if v_shop.id is null then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'price',price,'emoji',emoji,'sort_order',sort_order,'active',active) order by sort_order,created_at),'[]'::jsonb) into v_products from public.ko_products where shop_id=v_shop.id;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'order_no',order_no,'client_id',client_id,'status',status,'total',total,'items',items,'created_at',created_at) order by created_at desc),'[]'::jsonb) into v_orders from (select * from public.ko_orders where shop_id=v_shop.id order by created_at desc limit 200) q;
  return jsonb_build_object('shop_id',v_shop.id,'shop_name',v_shop.name,'next_order_no',v_shop.next_order_no,'products',v_products,'orders',v_orders);
end $$;

create or replace function public.create_order(p_secret text, p_client_id text, p_items jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_shop_id uuid; v_no integer; v_items jsonb; v_total integer;
begin
  v_shop_id := public.ko_shop_id(p_secret); if v_shop_id is null then raise exception 'お店が見つかりません'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'price',p.price,'emoji',p.emoji,'qty',x.qty)),'[]'::jsonb), coalesce(sum(p.price*x.qty),0)::integer
  into v_items,v_total
  from jsonb_to_recordset(coalesce(p_items,'[]'::jsonb)) as x(id text, qty integer)
  join public.ko_products p on p.id::text=x.id and p.shop_id=v_shop_id and p.active=true
  where x.qty > 0 and x.qty <= 99;
  if jsonb_array_length(v_items) = 0 then raise exception '商品が選ばれていません'; end if;
  update public.ko_shops set next_order_no=next_order_no+1 where id=v_shop_id returning next_order_no-1 into v_no;
  insert into public.ko_orders(shop_id,order_no,client_id,status,total,items) values(v_shop_id,v_no,coalesce(p_client_id,''),'received',v_total,v_items);
  return jsonb_build_object('order_no',v_no,'total',v_total);
end $$;

create or replace function public.update_order_status(p_secret text, p_order_id uuid, p_status text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_shop_id uuid;
begin
  if p_status not in ('received','cooking','ready','served') then raise exception '不正な状態です'; end if;
  v_shop_id:=public.ko_shop_id(p_secret); if v_shop_id is null then raise exception 'お店が見つかりません'; end if;
  update public.ko_orders set status=p_status where id=p_order_id and shop_id=v_shop_id;
  return found;
end $$;

create or replace function public.update_shop_name(p_secret text, p_name text)
returns boolean language plpgsql security definer set search_path = public
as $$ begin update public.ko_shops set name=coalesce(nullif(trim(p_name),''),'こどものお店') where secret_hash=public.ko_secret_hash(p_secret); return found; end $$;

create or replace function public.upsert_product(p_secret text, p_product_id uuid, p_name text, p_price integer, p_emoji text, p_sort_order integer, p_active boolean)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_shop_id uuid; v_id uuid;
begin
  v_shop_id:=public.ko_shop_id(p_secret); if v_shop_id is null then raise exception 'お店が見つかりません'; end if;
  if p_product_id is null then
    insert into public.ko_products(shop_id,name,price,emoji,sort_order,active) values(v_shop_id,coalesce(nullif(trim(p_name),''),'商品'),greatest(coalesce(p_price,0),0),coalesce(nullif(p_emoji,''),'🍽️'),coalesce(p_sort_order,0),coalesce(p_active,true)) returning id into v_id;
  else
    update public.ko_products set name=coalesce(nullif(trim(p_name),''),'商品'),price=greatest(coalesce(p_price,0),0),emoji=coalesce(nullif(p_emoji,''),'🍽️'),sort_order=coalesce(p_sort_order,sort_order),active=coalesce(p_active,active) where id=p_product_id and shop_id=v_shop_id returning id into v_id;
    if v_id is null then raise exception '商品が見つかりません'; end if;
  end if;
  return v_id;
end $$;

create or replace function public.delete_product(p_secret text, p_product_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$ declare v_shop_id uuid; begin v_shop_id:=public.ko_shop_id(p_secret); if v_shop_id is null then raise exception 'お店が見つかりません'; end if; delete from public.ko_products where id=p_product_id and shop_id=v_shop_id; return found; end $$;

create or replace function public.reset_shop_orders(p_secret text)
returns boolean language plpgsql security definer set search_path = public
as $$ declare v_shop_id uuid; begin v_shop_id:=public.ko_shop_id(p_secret); if v_shop_id is null then raise exception 'お店が見つかりません'; end if; delete from public.ko_orders where shop_id=v_shop_id; update public.ko_shops set next_order_no=1 where id=v_shop_id; return true; end $$;

revoke all on function public.ko_secret_hash(text) from public;
revoke all on function public.ko_shop_id(text) from public;
grant execute on function public.create_shop(text,text,jsonb) to anon, authenticated;
grant execute on function public.get_shop_state(text) to anon, authenticated;
grant execute on function public.create_order(text,text,jsonb) to anon, authenticated;
grant execute on function public.update_order_status(text,uuid,text) to anon, authenticated;
grant execute on function public.update_shop_name(text,text) to anon, authenticated;
grant execute on function public.upsert_product(text,uuid,text,integer,text,integer,boolean) to anon, authenticated;
grant execute on function public.delete_product(text,uuid) to anon, authenticated;
grant execute on function public.reset_shop_orders(text) to anon, authenticated;