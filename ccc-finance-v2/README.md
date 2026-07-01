# 제천 CCC 재정 관리 시스템 v2.0

## 🚀 배포 가이드

### 1단계: .env 파일 생성
프로젝트 루트에 `.env` 파일 생성 후 입력:
```
VITE_SUPABASE_URL=https://프로젝트ID.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_publishable_key
```

### 2단계: Supabase DB 세팅
Supabase → SQL Editor → `supabase_schema.sql` 내용 붙여넣기 → Run

### 3단계: Storage 버킷 생성
Supabase → Storage → New Bucket → 이름: `receipts` → Public 체크

### 4단계: 카카오 로그인 설정
1. developers.kakao.com → 앱 추가
2. 카카오 로그인 활성화
3. Redirect URI: `https://[supabase-id].supabase.co/auth/v1/callback`
4. Supabase → Authentication → Providers → Kakao → REST API 키 입력

### 5단계: Vercel 배포
1. GitHub에 코드 업로드
2. vercel.com → Import → 환경변수 설정
3. Deploy → 완료!

### 6단계: 관리자 계정 설정
배포 후 카카오 로그인 → Supabase → profiles 테이블 → 본인 role을 `admin` 으로 변경

## 📱 기능
- 카카오 로그인
- 납부 항목 추가 (대상 인원 선택)
- 납부 인증 사진 업로드
- 관리자 납부 확인/반려
- 진행중/완료 납부 탭
- 관리자/부관리자 관리
