import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { BookOpen, Check } from 'lucide-react'

const BOOKS = ['새생활', '만남']
const CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8]

// 순원 화면: 내 진도 확인 + 담당 순장 확인
export default function SunMember() {
  const { user, profile } = useAuth()
  const [leader, setLeader] = useState(null)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: prog }, leaderRes] = await Promise.all([
      supabase.from('sun_progress').select('*').eq('user_id', user.id),
      profile?.sun_leader_id
        ? supabase.from('profiles').select('*').eq('id', profile.sun_leader_id).single()
        : Promise.resolve({ data: null }),
    ])
    setProgress(prog || [])
    setLeader(leaderRes?.data || null)
    setLoading(false)
  }

  const doneSet = (book) => new Set(progress.filter(p => p.book === book).map(p => p.chapter))
  const totalDone = progress.length
  const totalAll = BOOKS.length * CHAPTERS.length

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar base="/sunmoim" />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* 담당 순장 + 전체 진도 요약 */}
        <div className="rounded-2xl p-6 text-white mb-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 60%, #f4c869 100%)' }}>
          <p className="text-sm text-white/80 mb-1">안녕하세요, {profile?.name}님 🌱</p>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-sm text-white/70">담당 순장님</p>
              <p className="text-2xl font-bold">{leader ? leader.name : '배정 대기 중'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">전체 진도</p>
              <p className="text-xl font-semibold">{totalDone} / {totalAll}과</p>
            </div>
          </div>
          <div className="bg-white/25 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.round(totalDone / totalAll * 100)}%` }} />
          </div>
          {!leader && <p className="text-xs text-white/70 mt-3">아직 담당 순장님이 배정되지 않았어요. 간사님께 문의해주세요!</p>}
        </div>

        {/* 교재별 진도 */}
        <div className="space-y-4">
          {BOOKS.map(book => {
            const done = doneSet(book)
            return (
              <div key={book} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><BookOpen size={16} /></span>
                    {book}
                  </p>
                  <span className="text-sm font-bold text-emerald-600">{done.size}/8과</span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {CHAPTERS.map(ch => (
                    <div key={ch} className="flex flex-col items-center gap-1">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        done.has(ch) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {done.has(ch) ? <Check size={14} /> : ch}
                      </span>
                      <span className="text-[9px] text-gray-400">{ch}과</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 rounded-full h-1.5 transition-all" style={{ width: `${done.size / 8 * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">진도 체크는 순모임 후 순장님이 해주세요 🙌</p>
      </div>
    </div>
  )
}
