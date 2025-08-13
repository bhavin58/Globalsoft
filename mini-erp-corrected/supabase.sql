-- Supabase table setup (minimal example)
create table if not exists items (
  id serial primary key,
  name text not null
);

create table if not exists inventory_transactions (
  id serial primary key,
  item_id int references items(id),
  type text,
  quantity int
);

-- Add more tables as needed for sales, procurement, manufacturing
