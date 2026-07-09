-- ============================================
-- 순모임 기능: 진도(sun_progress) + 순모임 인증(sun_meetings)
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run
-- (migration_mypage.sql, migration_sun.sql을 먼저 실행해야 합니다)
-- ============================================

-- 1. 순원 진도: 교재(새생활/만남) × 챕터(1~8) 체크
create table if not exists sun_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  book text not null check (book in ('새생활', '만남')),
  chapter int not null check (chapter between 1 and 8),
  checked_by uuid references profiles(id),
  checked_at timestamptz default now(),
  unique (user_id, book, chapter)
);
alter table sun_progress enable row level security;
create policy "진도 전체 읽기" on sun_progress for select using (auth.uid() is not null);
create policy "순장/간사 진도 체크" on sun_progress for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid()
          and (p.position in ('순장','간사') or p.role in ('admin','subadmin')))
);
create policy "순장/간사 진도 해제" on sun_progress for delete using (
  exists (select 1 from profiles p where p.id = auth.uid()
          and (p.position in ('순장','간사') or p.role in ('admin','subadmin')))
);

-- 2. 순모임 인증: 순장이 모임 기록 → 간사가 확인
create table if not exists sun_meetings (
  id uuid default gen_random_uuid() primary key,
  leader_id uuid references profiles(id) on delete cascade not null,
  meeting_date date not null default current_date,
  note text,
  member_ids uuid[] default '{}',
  confirmed_by uuid references profiles(id),
  confirmed_at timestamptz,
  created_at timestamptz default now()
);
alter table sun_meetings enable row level security;
create policy "인증 전체 읽기" on sun_meetings for select using (auth.uid() is not null);
create policy "순장 인증 생성" on sun_meetings for insert with check (auth.uid() = leader_id);
create policy "간사 인증 확인" on sun_meetings for update using (
  exists (select 1 from profiles p where p.id = auth.uid()
          and (p.position = '간사' or p.role in ('admin','subadmin')))
);
create policy "본인/관리자 인증 삭제" on sun_meetings for delete using (
  auth.uid() = leader_id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','subadmin'))
);
