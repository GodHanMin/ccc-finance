import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Check, ChevronDown, ChevronUp, CheckCircle, Clock, BookOpen } from 'lucide-react'

const BOOKS = ['새생활', '만남']
const CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8]

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

// 순장 화면: 순모임 인증하기 + 순원 진도 체크
export default function SunLeader() {
  const { user, profile } = useAuth()
  const [members, setMembers] = useState([])   // 내 순원들
  const [progress, setProgress] = useState([]) // 순원 진도
  const [meetings, setMeetings] = useState([]) // 내 순모임 인증 기록
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState(null)

  // 인증 폼
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: todayStr(), note: '' })
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: mem }, { data: prog }, { data: meet }] = await Promise.all([
      supabase.from('profiles').select('*').eq('sun_leader_id', user.id).order('name'),
      supabase.from('sun_progress').select('*'),
      supabase.from('sun_meetings').select('*').eq('leader_id', user.id).order('meeting_date', { ascending: false }),
    ])
    setMembers(mem || [])
    setProgress(prog || [])
    setMeetings(meet || [])
    setLoading(false)
  }

  const isChecked = (uid, book, ch) => progress.some(p => p.user_id === uid && p.book === book && p.chapter === ch)
  const doneCount = (uid, book) => progress.filter(p => p.user_id === uid && p.book === book).length

  // 진도 체크/해제
  async function toggleChapter(member, book, ch) {
    const key = `${member.id}-${book}-${ch}`
    setSaving(key)
    if (isChecked(member.id, book, ch)) {
      const { error } = await supabase.from('sun_progress').delete()
        .eq('user_id', member.id).eq('book', book).eq('chapter', ch)
      if (error) toast.error('오류가 발생했습니다')
    } else {
      const { error } = await supabase.from('sun_progress').insert({
        user_id: member.id, book, chapter: ch, checked_by: user.id,
      })
      if (error) toast.error('오류가 발생했습니다')
      else toast.success(`${member.name} · ${book} ${ch}과 체크 ✅`)
    }
    await fetchData()
    setSaving(null)
  }

  // 순모임 인증 제출
  async function submitMeeting() {
    if (!form.date) return toast.error('날짜를 선택해주세요')
    if (!selected.length) return toast.error('참석한 순원을 선택해주세요')
    setSubmitting(true)
    const { error } = await supabase.from('sun_meetings').insert({
      leader_id: user.id, meeting_date: form.date, note: form.note.trim(), member_ids: selected,
    })
    if (error) toast.error('오류가 발생했습니다')
    else {
      toast.success('순모임 인증 완료! 간사님이 확인합니다 🌱')
      setShowForm(false)
      setForm({ date: todayStr(), note: '' })
      setSelected([])
      await fetchData()
    }
    setSubmitting(false)
  }

  const nameOf = (id) => members.find(m => m.id === id)?.name || (id === user.id ? profile?.name : '?')

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/sunmoim" />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="rounded-2xl p-5 text-white mb-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
          <p className="text-sm text-white/80">🌱 {profile?.name} 순장님</p>
          <div className="flex justify-between items-end mt-1">
            <p className="text-2xl font-bold">내 순원 {members.length}명</p>
            <p className="text-sm text-white/80">인증한 순모임 {meetings.length}회</p>
          </div>
        </div>

        {/* 순모임 인증하기 */}
        <button onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold mb-4">
          <Plus size={16} />순모임 인증하기
        </button>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-3">순모임 인증</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">모임 날짜 *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">참석 순원 * ({selected.length}명)</label>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => setSelected(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        selected.includes(m.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                      }`}>
                      {m.name}
                    </button>
                  ))}
                  {!members.length && <p className="text-xs text-gray-400">아직 배정된 순원이 없어요</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">나눈 내용 (선택)</label>
                <input type="text" placeholder="예: 새생활 3과, 중간고사 기도제목 나눔" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">취소</button>
              <button onClick={submitMeeting} disabled={submitting}
                className="px-4 py-2 text-sm bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg hover:bg-emerald-700">
                {submitting ? '인증 중...' : '인증하기'}
              </button>
            </div>
          </div>
        )}

        {/* 순원 진도 체크 */}
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">순원 진도 체크</p>
        <div className="space-y-3 mb-6">
          {!members.length && <div className="bg-white rounded-xl p-8 text-center text-gray-400">배정된 순원이 없습니다<br /><span className="text-xs">간사님이 재정 → 가입자 명단에서 배정해줍니다</span></div>}
          {members.map(m => {
            const isOpen = expanded === m.id
            return (
              <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <button onClick={() => setExpanded(isOpen ? null : m.id)} className="w-full p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{m.name}</p>
                    {m.student_id && <span className="text-xs text-gray-400">{m.student_id}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">새생활 <b className="text-emerald-600">{doneCount(m.id, '새생활')}</b>/8 · 만남 <b className="text-emerald-600">{doneCount(m.id, '만남')}</b>/8</span>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-50 p-4 space-y-4">
                    {BOOKS.map(book => (
                      <div key={book}>
                        <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><BookOpen size={12} />{book}</p>
                        <div className="grid grid-cols-8 gap-1.5">
                          {CHAPTERS.map(ch => {
                            const done = isChecked(m.id, book, ch)
                            const key = `${m.id}-${book}-${ch}`
                            return (
                              <button key={ch} disabled={saving === key}
                                onClick={() => toggleChapter(m, book, ch)}
                                className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                                  done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-emerald-100'
                                } ${saving === key ? 'opacity-50' : ''}`}>
                                {done ? <Check size={13} className="mx-auto" /> : ch}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <p className="text-[11px] text-gray-400">과 번호를 누르면 체크/해제됩니다</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 내 인증 기록 */}
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">내 순모임 인증 기록</p>
        <div className="space-y-2">
          {!meetings.length && <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">아직 인증한 순모임이 없습니다</div>}
          {meetings.map(mt => (
            <div key={mt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{mt.meeting_date}</p>
                  <p className="text-xs text-gray-500 mt-0.5">참석: {(mt.member_ids || []).map(nameOf).join(', ') || '-'}</p>
                  {mt.note && <p className="text-xs text-gray-400 mt-0.5">{mt.note}</p>}
                </div>
                {mt.confirmed_at
                  ? <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 shrink-0"><CheckCircle size={12} />간사 확인</span>
                  : <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 shrink-0"><Clock size={12} />확인 대기</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
