-- Globalsoft Mini-ERP schema (Postgres / Supabase)

create table if not exists items (
  id bigint generated always as identity primary key,
  sku text unique not null,
  name text not null,
  description text,
  uom text default 'ea',
  category text,
  created_at timestamptz default now()
);

create table if not exists inventory_txns (
  id bigint generated always as identity primary key,
  item_id bigint references items(id) on delete cascade,
  txn_type text check (txn_type in ('IN','OUT')) not null,
  qty numeric not null,
  ref text,
  note text,
  created_at timestamptz default now()
);

create table if not exists sales_orders (
  id bigint generated always as identity primary key,
  so_number text unique not null,
  item_id bigint references items(id) on delete restrict,
  qty numeric not null,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists purchase_orders (
  id bigint generated always as identity primary key,
  po_number text unique not null,
  item_id bigint references items(id) on delete restrict,
  qty numeric not null,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists boms (
  id bigint generated always as identity primary key,
  parent_item_id bigint references items(id) on delete cascade,
  component_item_id bigint references items(id) on delete cascade,
  qty numeric not null
);

create table if not exists manufacturing_orders (
  id bigint generated always as identity primary key,
  mo_number text unique not null,
  finished_item_id bigint references items(id) on delete restrict,
  qty numeric not null,
  status text default 'planned',
  created_at timestamptz default now()
);

create or replace view v_stock_on_hand as
select i.id as item_id,
       i.sku,
       i.name,
       coalesce(sum(case when t.txn_type='IN' then t.qty else -t.qty end),0) as on_hand
from items i
left join inventory_txns t on t.item_id = i.id
group by i.id, i.sku, i.name;

alter table items enable row level security;
alter table inventory_txns enable row level security;
alter table sales_orders enable row level security;
alter table purchase_orders enable row level security;
alter table boms enable row level security;
alter table manufacturing_orders enable row level security;

drop policy if exists p_all_items on items;
create policy p_all_items on items for all using (true) with check (true);

drop policy if exists p_all_txns on inventory_txns;
create policy p_all_txns on inventory_txns for all using (true) with check (true);

drop policy if exists p_all_sos on sales_orders;
create policy p_all_sos on sales_orders for all using (true) with check (true);

drop policy if exists p_all_pos on purchase_orders;
create policy p_all_pos on purchase_orders for all using (true) with check (true);

drop policy if exists p_all_boms on boms;
create policy p_all_boms on boms for all using (true) with check (true);

drop policy if exists p_all_mos on manufacturing_orders;
create policy p_all_mos on manufacturing_orders for all using (true) with check (true);
