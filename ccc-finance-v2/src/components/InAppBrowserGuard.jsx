import { useEffect, useState } from 'react'

// 카카오톡, 인스타그램, 페이스북 등 인앱 브라우저 감지
// 구글 로그인은 보안 정책상 인앱 브라우저에서 항상 차단되므로,
// 감지되면 외부 브라우저로 유도한다.
function detectInAppBrowser() {
  const ua = navigator.userAgent || ''
  const isKakao = /KAKAOTALK/i.test(ua)
  const isInstagram = /Instagram/i.test(ua)
  const isFacebook = /FBAN|FBAV/i.test(ua)
  const isLine = /Line/i.test(ua)
  const isNaver = /NAVER\(inapp/i.test(ua)
  return { isKakao, isInstagram, isFacebook, isLine, isNaver, any: isKakao || isInstagram || isFacebook || isLine || isNaver }
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

export default function InAppBrowserGuard({ children }) {
  const [detected, setDetected] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDetected(detectInAppBrowser())
  }, [])

  if (!detected || !detected.any) {
    return children
  }

  const currentUrl = window.location.href

  function openInExternalBrowser() {
    if (isAndroid()) {
      // 안드로이드: intent 스킴으로 크롬 강제 실행
      const target = currentUrl.replace(/^https?:\/\//, '')
      window.location.href = `intent://${target}#Intent;scheme=https;package=com.android.chrome;end`
    } else {
      // iOS: 카카오톡 등은 자체적으로 "Safari로 열기" 메뉴를 제공하므로 안내만 표시
      handleCopy()
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(currentUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">외부 브라우저에서 열어주세요</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          카카오톡 등 앱 내 브라우저에서는 구글 로그인이 지원되지 않습니다.<br />
          Chrome이나 Safari로 열어야 로그인할 수 있어요.
        </p>

        {isAndroid() ? (
          <button
            onClick={openInExternalBrowser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors mb-3"
          >
            Chrome으로 열기
          </button>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-3 text-sm text-gray-600 text-left">
            <p className="font-semibold mb-1">iPhone에서는:</p>
            <p>오른쪽 아래(또는 위) <b>공유 아이콘</b> 또는 <b>···</b> 버튼을 눌러
              <b> "Safari로 열기"</b>를 선택해주세요.</p>
          </div>
        )}

        <button
          onClick={handleCopy}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          {copied ? '주소가 복사됐어요 ✓' : '주소 복사하기'}
        </button>
      </div>
    </div>
  )
}

