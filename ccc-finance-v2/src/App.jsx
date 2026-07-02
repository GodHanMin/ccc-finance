import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import MemberDashboard from './pages/MemberDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoadingScreen from './components/LoadingScreen'
import InAppBrowserGuard from './components/InAppBrowserGuard'
import InstallBanner from './components/InstallBanner'

// 재정 기능 전체 (로그인 필요) - "/finance/*" 하위에서 동작
function FinanceApp() {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  // 로그인(구글 OAuth)이 필요한 시점부터만 인앱 브라우저를 막는다 (허브는 누구나 볼 수 있어야 함)
  if (!user) return <InAppBrowserGuard><Login /></InAppBrowserGuard>
  if (!profile?.name) return <ProfileSetup />

  const isAdminRole = profile.role === 'admin' || profile.role === 'subadmin'

  return (
    <Routes>
      <Route index element={<Navigate to={isAdminRole ? 'admin' : 'member'} replace />} />
      <Route path="member" element={<MemberDashboard />} />
      <Route path="admin" element={isAdminRole ? <AdminDashboard /> : <Navigate to="../member" replace />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/finance/*" element={<FinanceApp />} />
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
