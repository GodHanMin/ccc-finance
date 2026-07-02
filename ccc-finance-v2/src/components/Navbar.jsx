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
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <span className="text-lg sm:text-xl font-bold text-blue-600 shrink-0">✝</span>
          <span className="font-bold text-gray-800 text-sm sm:text-base whitespace-nowrap">제천 CCC</span>
          {isAdminRole && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap shrink-0">
              {profile.role === 'admin' ? '관리자' : '부관리자'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isAdminRole && (
            <button
              onClick={() => navigate(onAdminScreen ? '/member' : '/admin')}
              className="flex items-center gap-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeftRight size={13} className="shrink-0" />
              <span>{onAdminScreen ? '납부' : '관리자'}</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
            <User size={16} className="shrink-0" /><span>{profile?.name}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap">
            <LogOut size={16} className="shrink-0" /><span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
