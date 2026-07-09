import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import MemberDashboard from './pages/MemberDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AttendanceMember from './pages/AttendanceMember'
import AttendanceAdmin from './pages/AttendanceAdmin'
import MyPage from './pages/MyPage'
import LoadingScreen from './components/LoadingScreen'
import InAppBrowserGuard from './components/InAppBrowserGuard'
import InstallBanner from './components/InstallBanner'

// 로그인이 필요한 기능 공통 껍데기
// - memberEl / adminEl : 각 기능의 member/admin 화면 컴포넌트
function ProtectedFeature({ memberEl, adminEl }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <InAppBrowserGuard><Login /></InAppBrowserGuard>
  if (!profile?.name) return <ProfileSetup />

  const isAdminRole = profile.role === 'admin' || profile.role === 'subadmin'

  return (
    <Routes>
      <Route index element={<Navigate to={isAdminRole ? 'admin' : 'member'} replace />} />
      <Route path="member" element={memberEl} />
      <Route path="admin" element={isAdminRole ? adminEl : <Navigate to="../member" replace />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}

// 로그인만 필요한 단일 화면 (member/admin 구분 없음)
function ProtectedPage({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <InAppBrowserGuard><Login /></InAppBrowserGuard>
  if (!profile?.name) return <ProfileSetup />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/finance/*" element={<ProtectedFeature memberEl={<MemberDashboard />} adminEl={<AdminDashboard />} />} />
      <Route path="/attendance/*" element={<ProtectedFeature memberEl={<AttendanceMember />} adminEl={<AttendanceAdmin />} />} />
      <Route path="/mypage" element={<ProtectedPage><MyPage /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <InstallBanner />
    </AuthProvider>
  )
}
