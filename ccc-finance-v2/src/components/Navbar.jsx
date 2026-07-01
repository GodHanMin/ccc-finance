import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User, ArrowLeftRight } from 'lucide-react'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRole = profile?.role === 'admin' || profile?.role === 'subadmin'
  const onAdminScreen = location.pathname.startsWith('/admin')

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">✝</span>
          <span className="font-bold text-gray-800">제천 CCC 재정</span>
          {isAdminRole && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
              {profile.role === 'admin' ? '관리자' : '부관리자'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdminRole && (
            <button
              onClick={() => navigate(onAdminScreen ? '/member' : '/admin')}
              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeftRight size={14} />
              <span>{onAdminScreen ? '납부하기' : '관리자 화면'}</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <User size={16} /><span>{profile?.name}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={16} /><span>로그아웃</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
