-- ============================================
-- 마이페이지 기능: profiles에 직책(position) 컬럼 추가
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run
-- ============================================

-- 1. position 컬럼 추가 (순원 / 순장 / 간사, 기본값 순원)
alter table profiles
  add column if not exists position text default '순원'
  check (position in ('순원', '순장', '간사'));

-- 2. 기존 가입자들의 position 값을 기본값으로 채움
update profiles set position = '순원' where position is null;
