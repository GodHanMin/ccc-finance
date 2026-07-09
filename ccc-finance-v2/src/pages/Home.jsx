import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function ComingSoonTile({ label, icon }) {
  return (
    <button
      onClick={() => toast(`${label} 기능은 준비 중이에요 🙏`)}
      className="relative aspect-square rounded-[18px] border border-gray-200 bg-white/60 flex flex-col items-center justify-center gap-2 opacity-60 active:scale-95 transition-transform"
    >
      <span className="absolute top-2 right-2 text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">준비중</span>
      <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">{icon}</span>
      <span className="text-[13px] font-semibold text-gray-700">{label}</span>
    </button>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      {/* 새벽하늘 히어로 */}
      <header
        className="relative overflow-hidden flex flex-col justify-end px-7 pt-14 pb-10 min-h-[42vh]"
        style={{ background: 'linear-gradient(180deg, #131a3d 0%, #4a4a8c 46%, #d98a5f 78%, #f4c869 100%)' }}
      >
        <div
          className="ccc-stars absolute inset-0 opacity-90"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 12% 18%, rgba(255,255,255,.85), transparent),
              radial-gradient(1.5px 1.5px at 28% 10%, rgba(255,255,255,.6), transparent),
              radial-gradient(1px 1px at 45% 22%, rgba(255,255,255,.7), transparent),
              radial-gradient(1.5px 1.5px at 62% 8%, rgba(255,255,255,.5), transparent),
              radial-gradient(1px 1px at 78% 16%, rgba(255,255,255,.75), transparent),
              radial-gradient(1.5px 1.5px at 90% 12%, rgba(255,255,255,.55), transparent)`
          }}
        />
        <div
          className="ccc-sun absolute left-1/2 -bottom-16 w-56 h-56 rounded-full blur-[1px]"
          style={{
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle at 50% 35%, #fff7e0 0%, #f4c869 55%, rgba(244,200,105,0) 78%)'
          }}
        />
        <svg className="absolute top-6 right-6 w-7 h-7 opacity-90" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 V22 M4 9 H20" stroke="rgba(255,255,255,.85)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="relative z-10">
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300 }} className="text-[15px] tracking-wide text-white/80 mb-2.5">
            Jecheon CCC
          </p>
          <h1 className="text-[34px] font-extrabold text-white leading-tight tracking-tight" style={{ textShadow: '0 2px 18px rgba(0,0,0,.18)' }}>
            제천 CCC
          </h1>
          <p className="mt-2.5 text-[14.5px] font-medium text-white/90 leading-relaxed max-w-[30ch]">
            함께 아침을 열고, 함께 세워가는 캠퍼스 공동체
          </p>
        </div>
      </header>

      <main className="max-w-[520px] mx-auto px-5 pb-16 pt-6">
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">바로가기</p>
        <div className="grid grid-cols-3 gap-2.5">
          <Link
            to="/finance"
            className="relative aspect-square rounded-[18px] flex flex-col items-center justify-center gap-2 border border-transparent bg-gradient-to-br from-white to-[#fff7ea] shadow-[0_1px_2px_rgba(28,27,46,.04),0_10px_24px_-12px_rgba(217,138,95,.35)] active:scale-95 hover:-translate-y-0.5 transition-transform"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(217,138,95,.6)]" style={{ background: 'linear-gradient(135deg, #d98a5f, #f4c869)' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="13" rx="2.2" stroke="#fff" strokeWidth="1.7" />
                <path d="M3 10H21" stroke="#fff" strokeWidth="1.7" />
                <circle cx="7" cy="14.5" r="1.1" fill="#fff" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-gray-800">재정</span>
          </Link>

          <Link
            to="/attendance"
            className="relative aspect-square rounded-[18px] flex flex-col items-center justify-center gap-2 border border-transparent bg-gradient-to-br from-white to-orange-50 shadow-[0_1px_2px_rgba(28,27,46,.04),0_10px_24px_-12px_rgba(217,138,95,.35)] active:scale-95 hover:-translate-y-0.5 transition-transform"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(217,138,95,.6)]" style={{ background: 'linear-gradient(135deg, #4a4a8c, #d98a5f)' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="14" r="7" stroke="#fff" strokeWidth="1.7" />
                <path d="M12 10.5V14L14.3 15.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M9 3H15 M12 3V6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-gray-800">아침모임 출석</span>
          </Link>
          <Link
            to="/sunmoim"
            className="relative aspect-square rounded-[18px] flex flex-col items-center justify-center gap-2 border border-transparent bg-gradient-to-br from-white to-emerald-50 shadow-[0_1px_2px_rgba(28,27,46,.04),0_10px_24px_-12px_rgba(16,185,129,.35)] active:scale-95 hover:-translate-y-0.5 transition-transform"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(16,185,129,.6)]" style={{ background: 'linear-gradient(135deg, #065f46, #10b981)' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M12 5C10 3.5 7 3 4 3.5V18.5C7 18 10 18.5 12 20C14 18.5 17 18 20 18.5V3.5C17 3 14 3.5 12 5Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M12 5V20" stroke="#fff" strokeWidth="1.7" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-gray-800">순모임</span>
          </Link>
          <ComingSoonTile
            label="공지사항"
            icon={
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M4 5.5C4 4.7 4.7 4 5.5 4H14L20 9V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V5.5Z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 12H16 M8 15.5H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            }
          />
        </div>

        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mt-7 mb-3">공지 · 소식</p>
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-white">
          <span className="shrink-0 w-8 h-8 rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2 V22 M4 9 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-gray-800">제천 CCC 재정 관리 시스템이 열렸습니다</p>
            <p className="text-xs text-gray-400 mt-0.5">회비 납부 및 확인은 [재정] 메뉴에서 진행해주세요</p>
          </div>
        </div>

        <div className="text-center mt-11 pt-5 border-t border-gray-200">
          <p className="text-[11.5px] text-gray-400 tracking-wide">제천 CCC · Jecheon Campus Crusade for Christ</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic' }} className="text-[13px] text-[#d98a5f] mt-1.5">
            "먼저 그 나라와 그 의를 구하라" — 마태복음 6:33
          </p>
        </div>
      </main>
    </div>
  )
}
