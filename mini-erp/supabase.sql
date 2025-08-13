-- Enable extensions
create extension if not exists "pgcrypto";

-- Items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  unit text not null default 'ea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stock transactions (positive = receipt/production, negative = sale/consumption)
create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  qty numeric not null,
  reason text not null check (reason in ('purchase_receipt','sale','adjustment','mo_production','mo_consumption')),
  ref text,
  note text,
  created_at timestamptz not null default now()
);

-- Bill of Materials
create table if not exists public.bom (
  id uuid primary key default gen_random_uuid(),
  parent_item_id uuid not null references public.items(id) on delete cascade,
  component_item_id uuid not null references public.items(id) on delete cascade,
  qty_per numeric not null check (qty_per > 0)
);

-- Manufacturing Orders
create table if not exists public.manufacturing_orders (
  id uuid primary key default gen_random_uuid(),
  product_item_id uuid not null references public.items(id),
  qty numeric not null check (qty > 0),
  status text not null default 'planned' check (status in ('planned','in_progress','done','cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Sales log (minimal: one row per quick sale)
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  qty numeric not null check (qty > 0),
  created_at timestamptz not null default now()
);

-- Procurement receipts log (minimal: one row per quick receipt)
create table if not exists public.procurements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  qty numeric not null check (qty > 0),
  created_at timestamptz not null default now()
);

-- Views

-- On hand by item
create or replace view public.v_item_onhand as
select i.id as item_id,
       i.sku,
       i.name,
       coalesce(sum(t.qty),0) as on_hand
from public.items i
left join public.stock_transactions t on t.item_id = i.id
group by i.id, i.sku, i.name
order by i.sku;

-- RLS: allow public read/write for MVP (no-auth). Tighten later!
alter table public.items enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.bom enable row level security;
alter table public.manufacturing_orders enable row level security;
alter table public.sales enable row level security;
alter table public.procurements enable row level security;

create policy "items all" on public.items
  for all using (true) with check (true);
create policy "stock all" on public.stock_transactions
  for all using (true) with check (true);
create policy "bom all" on public.bom
  for all using (true) with check (true);
create policy "mo all" on public.manufacturing_orders
  for all using (true) with check (true);
create policy "sales all" on public.sales
  for all using (true) with check (true);
create policy "proc all" on public.procurements
  for all using (true) with check (true);

-- Optional seed data
insert into public.items (sku, name, unit) values
  ('RM-STEEL', 'Raw Steel', 'kg'),
  ('RM-PLASTIC', 'Raw Plastic', 'kg'),
  ('FG-WIDGET', 'Finished Widget', 'ea')
on conflict (sku) do nothing;

-- Example BOM: 2 kg steel + 1 kg plastic -> 1 widget
insert into public.bom (parent_item_id, component_item_id, qty_per)
select p.id, c.id, 2 from public.items p, public.items c
where p.sku='FG-WIDGET' and c.sku='RM-STEEL' and not exists (
  select 1 from public.bom b 
  where b.parent_item_id=p.id and b.component_item_id=c.id
);

insert into public.bom (parent_item_id, component_item_id, qty_per)
select p.id, c.id, 1 from public.items p, public.items c
where p.sku='FG-WIDGET' and c.sku='RM-PLASTIC' and not exists (
  select 1 from public.bom b 
  where b.parent_item_id=p.id and b.component_item_id=c.id
);

-- Example starting inventory (receive 100 kg steel, 50 kg plastic)
insert into public.stock_transactions (item_id, qty, reason, ref, note)
select id, 100, 'purchase_receipt', 'SEED', 'Initial steel' from public.items where sku='RM-STEEL';
insert into public.stock_transactions (item_id, qty, reason, ref, note)
select id, 50, 'purchase_receipt', 'SEED', 'Initial plastic' from public.items where sku='RM-PLASTIC';
