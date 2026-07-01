import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { loginWithKakao } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-white">✝</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">제천 CCC</h1>
        <p className="text-gray-500 mt-1 mb-6">재정 관리 시스템</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
          <p>회비 납부 및 재정 현황을</p>
          <p>편리하게 확인하세요</p>
        </div>
        <button
          onClick={loginWithKakao}
          className="w-full bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.58 2 2 4.92 2 8.5c0 2.28 1.44 4.28 3.6 5.44L4.8 17l4.08-2.7c.37.05.74.08 1.12.08 4.42 0 8-2.92 8-6.5S14.42 2 10 2z" fill="#3C1E1E"/>
          </svg>
          카카오로 로그인
        </button>
        <p className="text-xs text-gray-400 mt-4">제천 CCC 가입자만 이용 가능합니다</p>
      </div>
    </div>
  )
}
