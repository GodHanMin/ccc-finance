import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Sunrise, Check, Flame } from 'lucide-react'

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

// start~end(포함) 사이 평일(월~금) 개수, end는 오늘을 넘지 않도록 잘라서 계산
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

export default function AttendanceMember() {
  const { user, profile } = useAuth()
  const [terms, setTerms] = useState([])
  const [myRecords, setMyRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: t }, { data: r }] = await Promise.all([
      supabase.from('attendance_terms').select('*').order('start_date', { ascending: false }),
      supabase.from('attendance_records').select('*').eq('user_id', user.id),
    ])
    setTerms(t || [])
    setMyRecords(r || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>

  const today = todayStr()
  const now = new Date()
  const isWeekday = now.getDay() !== 0 && now.getDay() !== 6
  const activeTerm = terms.find(t => t.start_date <= today && today <= t.end_date)
  const canCheckToday = isWeekday && !!activeTerm
  const checkedToday = myRecords.some(r => r.record_date === today)

  const myTermRecords = activeTerm ? myRecords.filter(r => r.record_date >= activeTerm.start_date && r.record_date <= activeTerm.end_date) : []
  const elapsedWeekdays = activeTerm ? countWeekdays(activeTerm.start_date, today < activeTerm.end_date ? today : activeTerm.end_date) : 0
  const rate = elapsedWeekdays ? Math.round((myTermRecords.length / elapsedWeekdays) * 100) : 0

  async function handleCheckIn() {
    setChecking(true)
    const { error } = await supabase.from('attendance_records').insert({ user_id: user.id, record_date: today })
    if (error) toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    else { toast.success('출석 완료! 오늘도 은혜로운 아침 되세요 ☀️'); await fetchData() }
    setChecking(false)
  }

  // 이번 주 월~금 상태 (지나간 날 체크 여부 표시)
  const weekDays = []
  if (activeTerm) {
    const monday = new Date(now)
    const diffToMon = (now.getDay() + 6) % 7
    monday.setDate(now.getDate() - diffToMon)
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const ds = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      const inTerm = ds >= activeTerm.start_date && ds <= activeTerm.end_date
      weekDays.push({
        label: ['월', '화', '수', '목', '금'][i],
        date: ds,
        done: myRecords.some(r => r.record_date === ds),
        isFuture: ds > today,
        inTerm,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/attendance" />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="rounded-2xl p-6 text-white mb-5 text-center" style={{ background: 'linear-gradient(135deg, #4a4a8c 0%, #d98a5f 100%)' }}>
          <p className="text-sm text-white/80 mb-1">안녕하세요, {profile?.name}님</p>
          {!activeTerm ? (
            <>
              <p className="text-2xl font-bold mt-2">🌙 방학 기간입니다</p>
              <p className="text-sm text-white/80 mt-1">학기가 시작되면 다시 출석 체크를 할 수 있어요</p>
            </>
          ) : !isWeekday ? (
            <>
              <p className="text-2xl font-bold mt-2">🌤️ 오늘은 주말이에요</p>
              <p className="text-sm text-white/80 mt-1">평일 아침 8시, 다음 모임에서 만나요</p>
            </>
          ) : checkedToday ? (
            <>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mt-3 mb-2">
                <Check size={30} />
              </div>
              <p className="text-xl font-bold">오늘 출석 완료!</p>
              <p className="text-sm text-white/80 mt-1">은혜로운 아침 되세요 ☀️</p>
            </>
          ) : (
            <>
              <Sunrise size={34} className="mx-auto mt-2 mb-2" />
              <p className="text-lg font-bold mb-4">오늘 아침모임 참석하셨나요?</p>
              <button
                onClick={handleCheckIn}
                disabled={checking}
                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full disabled:opacity-60 active:scale-95 transition-transform shadow-lg"
              >
                {checking ? '체크 중...' : '출석하기'}
              </button>
            </>
          )}
        </div>

        {activeTerm && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-gray-700">{activeTerm.name} 참여율</p>
                <span className="flex items-center gap-1 text-orange-500 font-bold text-sm"><Flame size={15} />{rate}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-full h-2 transition-all" style={{ width: `${rate}%` }} />
              </div>
              <p className="text-xs text-gray-400">{myTermRecords.length}일 출석 / 지금까지 {elapsedWeekdays}일 중</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">이번 주</p>
              <div className="grid grid-cols-5 gap-2">
                {weekDays.map(d => (
                  <div key={d.date} className={`rounded-xl py-3 flex flex-col items-center gap-1.5 ${!d.inTerm ? 'bg-gray-50 opacity-40' : d.done ? 'bg-orange-50' : d.isFuture ? 'bg-gray-50' : 'bg-red-50'}`}>
                    <span className="text-xs text-gray-500 font-medium">{d.label}</span>
                    {d.done ? (
                      <span className="w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center"><Check size={13} /></span>
                    ) : (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${d.isFuture || !d.inTerm ? 'bg-gray-200 text-gray-400' : 'bg-red-100 text-red-400'}`}>
                        {d.isFuture || !d.inTerm ? '·' : '✕'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
