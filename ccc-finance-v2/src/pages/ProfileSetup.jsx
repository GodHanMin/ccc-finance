import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ProfileSetup() {
  const { user, fetchProfile } = useAuth()
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error('이름을 입력해주세요')
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      student_id: studentId.trim(),
      role: 'member',
      email: user.email,
    })
    if (error) toast.error('오류가 발생했습니다')
    else { toast.success('환영합니다!'); await fetchProfile(user.id) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl text-white">✝</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">프로필 설정</h2>
          <p className="text-sm text-gray-500 mt-1">처음 방문하셨군요! 정보를 입력해주세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학번 (선택)</label>
            <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
              placeholder="20241234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-lg transition-colors">
            {loading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
