-- ============================================
-- 순 배정 기능: profiles에 순장 참조(sun_leader_id) 컬럼 추가
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run
-- (migration_mypage.sql을 먼저 실행해야 합니다)
-- ============================================

alter table profiles
  add column if not exists sun_leader_id uuid references profiles(id) on delete set null;

comment on column profiles.sun_leader_id is '이 가입자가 속한 순의 순장 profile id (null = 미배정)';

-- 보너스: 같은 날 중복 출석 기록 방지 (기존 중복이 있으면 먼저 정리 후 실행)
-- delete from attendance_records a using attendance_records b
--   where a.id > b.id and a.user_id = b.user_id and a.record_date = b.record_date;
alter table attendance_records
  add constraint attendance_unique_per_day unique (user_id, record_date);
