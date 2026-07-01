import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import MemberDashboard from './pages/MemberDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoadingScreen from './components/LoadingScreen'

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>
  if (!profile?.name) return <Routes><Route path="*" element={<ProfileSetup />} /></Routes>
  return (
    <Routes>
      <Route path="/" element={
        profile?.role === 'admin' || profile?.role === 'subadmin'
          ? <Navigate to="/admin" replace />
          : <Navigate to="/member" replace />
      } />
      <Route path="/member" element={<MemberDashboard />} />
      <Route path="/admin" element={
        profile?.role === 'admin' || profile?.role === 'subadmin'
          ? <AdminDashboard />
          : <Navigate to="/member" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
