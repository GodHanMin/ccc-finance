import { useEffect, useState } from 'react'

export default function InstallBanner() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    const dismissed = localStorage.getItem('ccc-install-dismissed')
    const ua = navigator.userAgent
    const iOS = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream
    const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|Line/i.test(ua)

    if (isStandalone || dismissed || isInApp) return
    setIsIOS(iOS)

    const onPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const timer = setTimeout(() => setVisible(true), 900)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); clearTimeout(timer) }
  }, [])

  async function handleAction() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setVisible(false)
    } else if (isIOS) {
      alert('하단 공유 아이콘(⬆️)을 누르고 "홈 화면에 추가"를 선택해주세요 📲')
    } else {
      alert('브라우저 메뉴(⋮)에서 "홈 화면에 추가"를 선택해주세요 📲')
    }
  }

  function handleClose() {
    setVisible(false)
    localStorage.setItem('ccc-install-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed left-3.5 right-3.5 bottom-3.5 max-w-[492px] mx-auto z-[60] bg-gray-900 text-white rounded-2xl px-3.5 py-3.5 flex items-center gap-3 shadow-2xl">
      <span className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d98a5f, #f4c869)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2 V22 M4 9 H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold">제천 CCC를 앱처럼 쓰세요</p>
        <p className="text-[11.5px] text-white/65 mt-0.5">
          {isIOS ? '공유 버튼 → "홈 화면에 추가"를 눌러주세요' : '홈 화면에 추가하면 앱처럼 실행돼요'}
        </p>
      </div>
      <button onClick={handleAction} className="shrink-0 bg-white text-gray-900 text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap">
        {isIOS ? '방법 보기' : '추가'}
      </button>
      <button onClick={handleClose} aria-label="닫기" className="shrink-0 w-5 h-5 text-white/50 text-base leading-none">✕</button>
    </div>
  )
}
