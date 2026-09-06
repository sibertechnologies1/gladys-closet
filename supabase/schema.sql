-- Run this in your Supabase project: SQL Editor -> New query -> paste -> Run.

-- ============= PRODUCTS =============
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_pesewas integer not null default 0,
  category text,
  audience text,
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer not null default 0,
  image_urls text[] default '{}',
  created_at timestamptz not null default now()
);

-- ============= ORDERS =============
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  delivery_address text,
  items jsonb not null default '[]',
  total_pesewas integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  paystack_reference text,
  created_at timestamptz not null default now()
);

-- ============= ROW LEVEL SECURITY =============
-- RLS is on by default for new Supabase tables, but we set it explicitly here.
alter table products enable row level security;
alter table orders enable row level security;

-- Anyone (including the not-yet-built public storefront) can READ products.
create policy "Public can view products"
  on products for select
  using (true);

-- Only a signed-in admin can add, edit, or delete products.
create policy "Authenticated users can manage products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- The public storefront will need to CREATE orders (customers checking out),
-- but should never be able to read other people's orders or edit them directly.
create policy "Public can create orders"
  on orders for insert
  with check (true);

-- Only a signed-in admin can view or update orders.
create policy "Authenticated users can view orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update orders"
  on orders for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============= STORAGE =============
-- After running this file, also do this manually in the Supabase dashboard:
-- 1. Go to Storage -> Create a new bucket named "product-images"
-- 2. Mark it as a PUBLIC bucket (so product photos can be shown on the site)

-- ============= YOUR FIRST ADMIN USER =============
-- Go to Authentication -> Users -> Add user, and create yourself an account
-- with your email and a password. That's what you'll log in with at /admin/login.
