import { useState } from 'react'

const steps = [
  {
    title: '계좌번호 복사하기',
    desc: '노란색 "입금 계좌" 박스를 탭하면 계좌번호가 자동으로 복사돼요.',
    icon: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="10" y="8" width="20" height="26" rx="4" fill="#fff" fillOpacity=".18"/>
        <rect x="10" y="8" width="20" height="26" rx="4" stroke="#fff" strokeWidth="2"/>
        <path d="M16 4h12a2 2 0 0 1 2 2v22" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 17h10 M15 22h10 M15 27h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: '요청된 금액 입금하기',
    desc: '복사한 계좌로 카드에 적힌 금액만큼 은행 앱에서 이체해요.',
    icon: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="6" y="18" width="32" height="16" rx="3" stroke="#fff" strokeWidth="2"/>
        <path d="M6 24h32" stroke="#fff" strokeWidth="2"/>
        <circle cx="14" cy="29" r="1.6" fill="#fff"/>
        <path d="M22 6v11M22 6l-5 5M22 6l5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: '입금 내역 캡처하기',
    desc: '은행 앱의 이체 완료 화면을 스크린샷으로 찍어둬요.',
    icon: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="9" y="7" width="26" height="32" rx="4" stroke="#fff" strokeWidth="2"/>
        <path d="M17 7h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
        <rect x="13" y="14" width="18" height="13" rx="2" fill="#fff" fillOpacity=".18" stroke="#fff" strokeWidth="1.6"/>
        <circle cx="22" cy="20.5" r="3.4" stroke="#fff" strokeWidth="1.6"/>
        <path d="M9 33l7-3 5 3 6-4 6 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: '납부 인증 올리기',
    desc: '항목 카드의 "납부 인증" 버튼을 눌러 캡처한 사진을 올려요.',
    icon: (
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M22 30V12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M15 19l7-7 7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 30v4a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2v-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: '승인 기다리기',
    desc: '관리자가 확인하면 자동으로 "납부완료"로 바뀌어요. 끝!',
    icon: (
      <svg viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="15" stroke="#fff" strokeWidth="2"/>
        <path d="M15 22.5l4.8 4.8L29.5 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function HowToGuide() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span className="text-blue-500">❓</span>사용법
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[88vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 bg-blue-600 text-white shrink-0 relative">
              <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white/70 hover:text-white text-xl leading-none">✕</button>
              <p className="text-xs text-blue-100 font-medium mb-1">이렇게 사용해요</p>
              <p className="text-lg font-bold">회비 납부, 5단계면 끝!</p>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="relative">
                <div className="absolute left-[21px] top-2 bottom-2 w-px bg-gray-100" />
                <div className="space-y-6">
                  {steps.map((s, i) => (
                    <div key={i} className="flex gap-3.5 relative">
                      <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm relative z-10">
                        {s.icon}
                      </div>
                      <div className="pt-1.5">
                        <p className="text-[11px] font-bold text-blue-500 mb-0.5">STEP {i + 1}</p>
                        <p className="font-bold text-gray-800 text-sm mb-0.5">{s.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                <p className="text-xs font-bold text-amber-800 mb-1">💡 회비 말고 직접 낼 게 있다면?</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">교재비처럼 미리 낸 돈이 있으면, 상단의 "직접 신청하기" 버튼으로 같은 방식으로 신청할 수 있어요.</p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                알겠어요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
