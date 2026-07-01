-- profiles 테이블
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  student_id text,
  role text default 'member' check (role in ('member', 'admin', 'subadmin')),
  email text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "본인 읽기" on profiles for select using (auth.uid() = id);
create policy "본인 수정" on profiles for update using (auth.uid() = id);
create policy "프로필 생성" on profiles for insert with check (auth.uid() = id);
create policy "관리자 전체 읽기" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);
create policy "관리자 수정" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);

-- payment_items 테이블
create table payment_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  amount integer not null,
  description text,
  target_ids uuid[] default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
alter table payment_items enable row level security;
create policy "전체 읽기" on payment_items for select using (auth.uid() is not null);
create policy "관리자 생성" on payment_items for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);
create policy "관리자 삭제" on payment_items for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);

-- payments 테이블
create table payments (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references payment_items(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending','confirmed','rejected')),
  receipt_url text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);
alter table payments enable row level security;
create policy "본인 납부 읽기" on payments for select using (auth.uid() = user_id);
create policy "본인 납부 생성" on payments for insert with check (auth.uid() = user_id);
create policy "본인 납부 수정" on payments for update using (auth.uid() = user_id);
create policy "관리자 전체 읽기" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);
create policy "관리자 상태 변경" on payments for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','subadmin'))
);

-- storage: receipts 버킷은 Supabase 대시보드에서 수동 생성 (Public)
