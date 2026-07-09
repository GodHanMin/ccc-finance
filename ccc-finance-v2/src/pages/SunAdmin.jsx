import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { CheckCircle, Clock, BookOpen } from 'lucide-react'

const BOOKS = ['새생활', '만남']

// 간사/관리자 화면: 순장 인증 확인 + 전체 순모임 진행상황
export default function SunAdmin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('confirm')
  const [profiles, setProfiles] = useState([])
  const [progress, setProgress] = useState([])
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: p }, { data: prog }, { data: meet }] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('sun_progress').select('*'),
      supabase.from('sun_meetings').select('*').order('meeting_date', { ascending: false }),
    ])
    setProfiles(p || [])
    setProgress(prog || [])
    setMeetings(meet || [])
    setLoading(false)
  }

  async function confirmMeeting(id) {
    const { error } = await supabase.from('sun_meetings')
      .update({ confirmed_by: user.id, confirmed_at: new Date().toISOString() }).eq('id', id)
    if (error) return toast.error('오류가 발생했습니다')
    toast.success('인증 확인 완료 ✅')
    fetchAll()
  }

  const nameOf = (id) => profiles.find(p => p.id === id)?.name || '?'
  const doneCount = (uid, book) => progress.filter(p => p.user_id === uid && p.book === book).length

  const pending = meetings.filter(m => !m.confirmed_at)
  const leaders = profiles.filter(p => p.position === '순장')

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  const tabStyle = (t) => tab === t
    ? 'px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white'
    : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200'

  // 진도 미니 바
  function ProgressBar({ uid, book }) {
    const n = doneCount(uid, book)
    return (
      <div className="flex items-center gap-1.5 w-full">
        <span className="text-[10px] text-gray-400 w-9 shrink-0">{book}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${n / 8 * 100}%` }} />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 w-6 text-right shrink-0">{n}/8</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/sunmoim" />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-500">{pending.length}</p>
            <p className="text-xs text-gray-500 mt-1">확인 대기 인증</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{meetings.length}</p>
            <p className="text-xs text-gray-500 mt-1">전체 순모임 인증</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-700">{leaders.length}</p>
            <p className="text-xs text-gray-500 mt-1">순장 수</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('confirm')} className={tabStyle('confirm')}>
            인증 확인{pending.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setTab('overview')} className={tabStyle('overview')}>전체 진행상황</button>
        </div>

        {/* 인증 확인 */}
        {tab === 'confirm' && (
          <div className="space-y-3">
            {!meetings.length && <div className="bg-white rounded-xl p-8 text-center text-gray-400">순모임 인증 내역이 없습니다</div>}
            {[...meetings].sort((a, b) => (a.confirmed_at ? 1 : 0) - (b.confirmed_at ? 1 : 0)).map(mt => (
              <div key={mt.id} className={`bg-white rounded-xl shadow-sm border p-4 ${!mt.confirmed_at ? 'border-yellow-200' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">🌱 {nameOf(mt.leader_id)} 순장</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mt.confirmed_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {mt.confirmed_at ? '확인 완료' : '대기'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{mt.meeting_date} · 참석 {(mt.member_ids || []).length}명 ({(mt.member_ids || []).map(nameOf).join(', ')})</p>
                    {mt.note && <p className="text-xs text-gray-400 mt-0.5">💬 {mt.note}</p>}
                  </div>
                  {!mt.confirmed_at && (
                    <button onClick={() => confirmMeeting(mt.id)}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-lg shrink-0">
                      <CheckCircle size={14} />확인
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 전체 진행상황: 순장 → 담당 순원 + 현 진도 */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {!leaders.length && <div className="bg-white rounded-xl p-8 text-center text-gray-400">순장이 없습니다. 재정 → 가입자 명단에서 직책을 지정해주세요.</div>}
            {leaders.map(l => {
              const sunMembers = profiles.filter(p => p.sun_leader_id === l.id && p.id !== l.id)
              const leaderMeetings = meetings.filter(m => m.leader_id === l.id)
              return (
                <div key={l.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60 rounded-t-xl">
                    <p className="font-bold text-gray-700 text-sm">🌱 {l.name} 순 <span className="text-xs font-medium text-gray-400 ml-1">순원 {sunMembers.length}명</span></p>
                    <span className="text-xs text-gray-500">순모임 인증 <b className="text-emerald-600">{leaderMeetings.length}</b>회</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {!sunMembers.length && <p className="p-4 text-sm text-gray-300">배정된 순원이 없습니다</p>}
                    {sunMembers.map(m => (
                      <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <div className="sm:w-36 shrink-0">
                          <p className="font-medium text-gray-800">{m.name}</p>
                          {m.student_id && <p className="text-xs text-gray-400">{m.student_id}</p>}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {BOOKS.map(book => <ProgressBar key={book} uid={m.id} book={book} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
