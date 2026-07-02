import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Trash2, Flame } from 'lucide-react'

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

function countWeekdays(start, end) {
  let count = 0
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export default function AttendanceAdmin() {
  const [tab, setTab] = useState('status')
  const [terms, setTerms] = useState([])
  const [members, setMembers] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const [showTermForm, setShowTermForm] = useState(false)
  const [termForm, setTermForm] = useState({ name: '', start_date: '', end_date: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: t }, { data: m }, { data: r }] = await Promise.all([
      supabase.from('attendance_terms').select('*').order('start_date', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'member').order('name'),
      supabase.from('attendance_records').select('*'),
    ])
    setTerms(t || [])
    setMembers(m || [])
    setRecords(r || [])
    setLoading(false)
  }

  async function createTerm() {
    if (!termForm.name.trim()) return toast.error('학기 이름을 입력해주세요')
    if (!termForm.start_date || !termForm.end_date) return toast.error('시작일/종료일을 입력해주세요')
    if (termForm.end_date < termForm.start_date) return toast.error('종료일이 시작일보다 빠릅니다')
    const { error } = await supabase.from('attendance_terms').insert({
      name: termForm.name.trim(), start_date: termForm.start_date, end_date: termForm.end_date,
    })
    if (error) return toast.error('오류가 발생했습니다')
    toast.success('학기가 등록됐습니다 ✅')
    setShowTermForm(false)
    setTermForm({ name: '', start_date: '', end_date: '' })
    fetchAll()
  }

  async function deleteTerm(id) {
    if (!confirm('이 학기 정보를 삭제하시겠습니까? (출석 기록 자체는 남아있습니다)')) return
    await supabase.from('attendance_terms').delete().eq('id', id)
    toast.success('삭제됐습니다')
    fetchAll()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>

  const today = todayStr()
  const activeTerm = terms.find(t => t.start_date <= today && today <= t.end_date)
  const statusTerm = activeTerm || terms[0]
  const elapsedWeekdays = statusTerm ? countWeekdays(statusTerm.start_date, today < statusTerm.end_date ? today : statusTerm.end_date) : 0

  const memberStats = members.map(m => {
    const myRecs = statusTerm ? records.filter(r => r.user_id === m.id && r.record_date >= statusTerm.start_date && r.record_date <= statusTerm.end_date) : []
    const rate = elapsedWeekdays ? Math.round((myRecs.length / elapsedWeekdays) * 100) : 0
    return { ...m, count: myRecs.length, rate }
  }).sort((a, b) => b.rate - a.rate)

  // 이번 주 월~금 날짜 계산
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  })
  const weekLabels = ['월', '화', '수', '목', '금']

  const userRecordDates = (userId) => new Set(records.filter(r => r.user_id === userId).map(r => r.record_date))

  const todayCheckedCount = records.filter(r => r.record_date === today).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/attendance" />
      <div className="max-w-4xl mx-auto px-4 py-6">

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{todayCheckedCount}</p>
            <p className="text-xs text-gray-500 mt-1">오늘 출석 인원</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-700">{members.length}</p>
            <p className="text-xs text-gray-500 mt-1">전체 가입자</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-lg font-bold text-gray-700 truncate">{activeTerm ? activeTerm.name : '방학중'}</p>
            <p className="text-xs text-gray-500 mt-1">현재 상태</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('status')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'status' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>참여 현황</button>
          <button onClick={() => setTab('terms')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'terms' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>학기 관리</button>
        </div>

        {tab === 'status' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-700">🔥 {statusTerm ? statusTerm.name : '학기 정보 없음'} 참여율</p>
              <div className="hidden sm:flex gap-1.5 pr-1">
                {weekLabels.map(l => <span key={l} className="w-6 text-center text-[10px] font-medium text-gray-400">{l}</span>)}
              </div>
            </div>
            {!statusTerm && <p className="text-xs text-gray-400 px-4 pt-1">학기 관리 탭에서 먼저 학기를 등록해주세요</p>}
            <div className="divide-y divide-gray-50">
              {memberStats.map(m => {
                const myDates = userRecordDates(m.id)
                return (
                  <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex items-center justify-between sm:block">
                      <div>
                        <p className="font-medium text-gray-800">{m.name}</p>
                        {m.student_id && <p className="text-xs text-gray-400">{m.student_id}</p>}
                      </div>
                      <div className="flex sm:hidden items-center gap-1">
                        <span className={`font-bold text-sm ${m.rate >= 80 ? 'text-orange-500' : m.rate >= 50 ? 'text-amber-500' : 'text-gray-400'}`}>{m.rate}%</span>
                        {m.rate >= 80 && <Flame size={13} className="text-orange-500" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex gap-1.5">
                        {weekDates.map((d, i) => {
                          const done = myDates.has(d)
                          const isFuture = d > today
                          return (
                            <div key={d} className="flex flex-col items-center gap-1">
                              <span className="sm:hidden text-[9px] text-gray-400">{weekLabels[i]}</span>
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  done ? 'bg-emerald-500 text-white' : isFuture ? 'bg-gray-100 text-gray-300' : 'bg-red-50 text-red-300'
                                }`}
                              >
                                {done ? '✓' : isFuture ? '' : '✕'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="hidden sm:flex items-center gap-2 w-24 justify-end shrink-0">
                        <span className="text-xs text-gray-400">{m.count}/{elapsedWeekdays}일</span>
                        <span className={`font-bold text-sm ${m.rate >= 80 ? 'text-orange-500' : m.rate >= 50 ? 'text-amber-500' : 'text-gray-400'}`}>{m.rate}%</span>
                        {m.rate >= 80 && <Flame size={13} className="text-orange-500" />}
                      </div>
                    </div>
                  </div>
                )
              })}
              {memberStats.length === 0 && <div className="p-8 text-center text-gray-400">가입자가 없습니다</div>}
            </div>
          </div>
        )}

        {tab === 'terms' && (
          <div>
            <button onClick={() => setShowTermForm(!showTermForm)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
              <Plus size={16} />학기 등록
            </button>

            {showTermForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">학기 이름 *</label>
                    <input type="text" placeholder="2026-1학기" value={termForm.name}
                      onChange={e => setTermForm({ ...termForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">시작일 *</label>
                      <input type="date" value={termForm.start_date}
                        onChange={e => setTermForm({ ...termForm, start_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">종료일 *</label>
                      <input type="date" value={termForm.end_date}
                        onChange={e => setTermForm({ ...termForm, end_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowTermForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">취소</button>
                  <button onClick={createTerm} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">등록</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {terms.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400">등록된 학기가 없습니다</div>}
              {terms.map(t => {
                const isActive = t.start_date <= today && today <= t.end_date
                return (
                  <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{t.name}</p>
                        {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">진행중</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{t.start_date} ~ {t.end_date}</p>
                    </div>
                    <button onClick={() => deleteTerm(t.id)} className="p-1 hover:bg-red-50 text-red-400 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
