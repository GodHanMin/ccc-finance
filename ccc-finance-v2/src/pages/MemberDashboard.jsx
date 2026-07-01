import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function MemberDashboard() {
  const { user, profile } = useAuth()
  const [items, setItems] = useState([])
  const [myPayments, setMyPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [tab, setTab] = useState('ongoing')
  const [receiptModal, setReceiptModal] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: itemsData }, { data: paymentsData }] = await Promise.all([
      supabase.from('payment_items').select('*').contains('target_ids', [user.id]),
      supabase.from('payments').select('*').eq('user_id', user.id)
    ])
    setItems(itemsData || [])
    setMyPayments(paymentsData || [])
    setLoading(false)
  }

  function getMyPayment(itemId) {
    return myPayments.find(p => p.item_id === itemId)
  }

  async function handleFileChange(item, e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('5MB 이하 파일만 가능합니다')
    setUploading(item.id)
    try {
      let receiptUrl = null
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}/${item.id}_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('receipts').upload(fileName, file)
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
      receiptUrl = urlData.publicUrl

      const existing = getMyPayment(item.id)
      if (existing) {
        await supabase.from('payments').update({ status: 'pending', receipt_url: receiptUrl }).eq('id', existing.id)
      } else {
        await supabase.from('payments').insert({ item_id: item.id, user_id: user.id, status: 'pending', receipt_url: receiptUrl })
      }
      toast.success('납부 신청 완료! 관리자가 확인 후 승인합니다.')
      await fetchData()
    } catch { toast.error('오류가 발생했습니다. 다시 시도해주세요.') }
    setUploading(null)
  }

  const ongoingItems = items.filter(item => {
    const p = getMyPayment(item.id)
    return !p || p.status === 'pending' || p.status === 'rejected'
  })
  const doneItems = items.filter(item => getMyPayment(item.id)?.status === 'confirmed')
  const paidAmt = doneItems.reduce((s, i) => s + i.amount, 0)
  const totalAmt = items.reduce((s, i) => s + i.amount, 0)
  const pct = totalAmt ? Math.round(paidAmt / totalAmt * 100) : 0

  function ItemCard({ item }) {
    const pay = getMyPayment(item.id)
    let statusEl, actionEl, noteEl = null

    if (!pay) {
      statusEl = <span className="text-sm text-gray-400">미납부</span>
      actionEl = (
        <label className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${uploading===item.id?'bg-gray-100 text-gray-400':'bg-blue-600 text-white hover:bg-blue-700'}`}>
          <Upload size={14} />{uploading===item.id?'업로드 중...':'납부 인증'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading===item.id} onChange={e=>handleFileChange(item,e)}/>
        </label>
      )
    } else if (pay.status === 'pending') {
      statusEl = <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700"><Clock size={14}/>확인 중</span>
      actionEl = <span className="text-xs text-gray-400">관리자 확인 중...</span>
    } else if (pay.status === 'confirmed') {
      statusEl = <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700"><CheckCircle size={14}/>납부 완료</span>
      actionEl = pay.receipt_url ? <button onClick={()=>setReceiptModal(pay.receipt_url)} className="text-xs text-blue-500 hover:underline">📎 증빙 보기</button> : null
    } else if (pay.status === 'rejected') {
      statusEl = <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700"><XCircle size={14}/>반려됨</span>
      actionEl = (
        <label className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
          <Upload size={14}/>재신청
          <input type="file" accept="image/*" className="hidden" onChange={e=>handleFileChange(item,e)}/>
        </label>
      )
      noteEl = <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">❗ 반려되었습니다. 다시 납부 인증을 올려주세요.</div>
    }

    return (
      <div className={`bg-white rounded-xl shadow-sm border p-4 ${pay?.status==='pending'?'border-yellow-200':pay?.status==='confirmed'?'border-green-100':'border-gray-100'}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-800">{item.title}</h3>
            {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
          </div>
          <p className="font-bold text-lg text-blue-600 ml-2 shrink-0">{item.amount.toLocaleString()}원</p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          {statusEl}{actionEl}
        </div>
        {noteEl}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-blue-600 rounded-2xl p-5 text-white mb-6">
          <p className="text-blue-100 text-sm mb-1">안녕하세요, {profile?.name}님 👋</p>
          <div className="flex justify-between items-end mb-3">
            <div><p className="text-sm text-blue-200">납부 완료 금액</p><p className="text-3xl font-bold">{paidAmt.toLocaleString()}원</p></div>
            <div className="text-right"><p className="text-sm text-blue-200">전체 금액</p><p className="text-xl font-semibold">{totalAmt.toLocaleString()}원</p></div>
          </div>
          <div className="bg-blue-500 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{width:`${pct}%`}}/>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={()=>setTab('ongoing')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='ongoing'?'bg-blue-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>
            진행중 <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==='ongoing'?'bg-white text-blue-600':'bg-blue-100 text-blue-600'}`}>{ongoingItems.length}</span>
          </button>
          <button onClick={()=>setTab('done')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='done'?'bg-blue-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>
            완료한 납부 <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==='done'?'bg-white text-blue-600':'bg-green-100 text-green-600'}`}>{doneItems.length}</span>
          </button>
        </div>

        <div className="space-y-3">
          {tab === 'ongoing' && (
            ongoingItems.length
              ? ongoingItems.map(item => <ItemCard key={item.id} item={item}/>)
              : <div className="bg-white rounded-xl p-8 text-center text-gray-400">진행중인 납부 항목이 없습니다 🎉</div>
          )}
          {tab === 'done' && (
            doneItems.length
              ? doneItems.map(item => <ItemCard key={item.id} item={item}/>)
              : <div className="bg-white rounded-xl p-8 text-center text-gray-400">완료한 납부가 없습니다</div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-bold text-yellow-800 mb-1">💳 입금 계좌</p>
          <p className="text-sm text-yellow-700">카카오뱅크 3333344408600</p>
          <p className="text-sm text-yellow-700">예금주: 강한민</p>
          <p className="text-xs text-yellow-600 mt-1">입금 후 납부 인증 버튼을 눌러주세요!</p>
        </div>
      </div>

      {receiptModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={()=>setReceiptModal(null)}>
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-gray-800">납부 증빙 사진</p>
              <button onClick={()=>setReceiptModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <img src={receiptModal} alt="receipt" className="w-full rounded-xl"/>
          </div>
        </div>
      )}
    </div>
  )
}
