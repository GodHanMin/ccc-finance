import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { User, GraduationCap, BadgeCheck } from 'lucide-react'

export const POSITIONS = ['순원', '순장', '간사']

export default function MyPage() {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.name || '')
  const [studentId, setStudentId] = useState(profile?.student_id || '')
  const [position, setPosition] = useState(profile?.position || '순원')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error('이름을 입력해주세요')
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      name: name.trim(),
      student_id: studentId.trim(),
      position,
    }).eq('id', user.id)
    if (error) toast.error('저장 중 오류가 발생했습니다')
    else {
      await fetchProfile(user.id)
      toast.success('프로필이 저장됐습니다 ✅')
    }
    setSaving(false)
  }

  const roleLabel = profile?.role === 'admin' ? '관리자' : profile?.role === 'subadmin' ? '부관리자' : '가입자'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/mypage" />
      <div className="max-w-md mx-auto px-4 py-6">

        {/* 프로필 카드 */}
        <div className="rounded-2xl p-6 text-white mb-5 text-center" style={{ background: 'linear-gradient(135deg, #131a3d 0%, #4a4a8c 60%, #d98a5f 100%)' }}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <User size={28} />
          </div>
          <p className="text-xl font-bold">{profile?.name || '이름 미설정'}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">{profile?.position || '순원'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">{roleLabel}</span>
          </div>
          {profile?.student_id && <p className="text-xs text-white/70 mt-2">학번 {profile.student_id}</p>}
        </div>

        {/* 수정 폼 */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-bold text-gray-800">내 정보 수정</h3>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <User size={14} className="text-gray-400" />이름 *
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <GraduationCap size={14} className="text-gray-400" />학번 (선택)
            </label>
            <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
              placeholder="20241234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
              <BadgeCheck size={14} className="text-gray-400" />직책 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(p => (
                <button key={p} type="button" onClick={() => setPosition(p)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    position === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">순모임에서의 직책을 선택해주세요</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
              돌아가기
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white transition-colors">
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          계정 이메일: {user?.email || '이메일 정보 없음'}
        </p>
      </div>
    </div>
  )
}
