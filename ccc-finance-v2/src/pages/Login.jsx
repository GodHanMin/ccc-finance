import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { loginWithGoogle } = useAuth()
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
          onClick={loginWithGoogle}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md border border-gray-300"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
              c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
              c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
              l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
              c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
              c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
              C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Google로 로그인
        </button>
        {/* 카카오 로그인 - 비즈 앱 승인 후 활성화 예정
        <button
          onClick={loginWithKakao}
          className="w-full bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md mt-3"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.58 2 2 4.92 2 8.5c0 2.28 1.44 4.28 3.6 5.44L4.8 17l4.08-2.7c.37.05.74.08 1.12.08 4.42 0 8-2.92 8-6.5S14.42 2 10 2z" fill="#3C1E1E"/>
          </svg>
          카카오로 로그인
        </button>
        */}
        <p className="text-xs text-gray-400 mt-4">제천 CCC 가입자만 이용 가능합니다</p>
      </div>
    </div>
  )
}
