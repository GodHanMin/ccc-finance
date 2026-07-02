import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import HowToGuide from '../components/HowToGuide'

export default function MemberDashboard() {
  const { user, profile } = useAuth()
  const [items, setItems] = useState([])
  const [myPayments, setMyPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [tab, setTab] = useState('ongoing')
  const [receiptModal, setReceiptModal] = useState(null)

  // 직접 신청하기 모달
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({ title: '', amount: '', description: '' })
  const [requestFile, setRequestFile] = useState(null)
  const [submittingRequest, setSubmittingRequest] = useState(false)

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

  // 뒤로가기를 누르면 사진 모달만 닫히도록 처리
  useEffect(() => {
    if (!receiptModal) return
    window.history.pushState({ modal: 'receipt' }, '')
    const onPop = () => setReceiptModal(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [receiptModal])

  function closeReceiptModal() {
    if (window.history.state?.modal === 'receipt') window.history.back()
    else setReceiptModal(null)
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

  async function handleSubmitRequest() {
    if (!requestForm.title.trim()) return toast.error('항목명을 입력해주세요')
    if (!requestForm.amount) return toast.error('금액을 입력해주세요')
    if (!requestFile) return toast.error('증빙 사진을 첨부해주세요')
    if (requestFile.size > 5 * 1024 * 1024) return toast.error('5MB 이하 파일만 가능합니다')

    setSubmittingRequest(true)
    try {
      // 1. 본인 명의 항목 생성 (신청받은 항목으로 표시)
      const { data: newItem, error: itemErr } = await supabase.from('payment_items').insert({
        title: requestForm.title.trim(),
        amount: parseInt(requestForm.amount),
        description: requestForm.description.trim(),
        target_ids: [user.id],
        created_by: user.id,
        is_self_requested: true,
      }).select().single()
      if (itemErr) throw itemErr

      // 2. 증빙 사진 업로드
      const ext = requestFile.name.split('.').pop()
      const fileName = `${user.id}/${newItem.id}_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('receipts').upload(fileName, requestFile)
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)

      // 3. 납부 신청 등록 (관리자 승인 대기)
      const { error: payErr } = await supabase.from('payments').insert({
        item_id: newItem.id, user_id: user.id, status: 'pending', receipt_url: urlData.publicUrl,
      })
      if (payErr) throw payErr

      toast.success('신청 완료! 관리자가 확인 후 승인합니다.')
      setShowRequestForm(false)
      setRequestForm({ title: '', amount: '', description: '' })
      setRequestFile(null)
      await fetchData()
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    }
    setSubmittingRequest(false)
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

        <div className="flex gap-2 mb-3">
          <button onClick={()=>setTab('ongoing')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='ongoing'?'bg-blue-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>
            진행중 <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==='ongoing'?'bg-white text-blue-600':'bg-blue-100 text-blue-600'}`}>{ongoingItems.length}</span>
          </button>
          <button onClick={()=>setTab('done')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='done'?'bg-blue-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>
            완료한 납부 <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==='done'?'bg-white text-blue-600':'bg-green-100 text-green-600'}`}>{doneItems.length}</span>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <HowToGuide />
          <button onClick={()=>setShowRequestForm(true)} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            <Plus size={15}/>직접 신청하기
          </button>
        </div>

        {showRequestForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={()=>setShowRequestForm(false)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
              <h3 className="font-bold text-gray-800 mb-1">직접 납부 신청</h3>
              <p className="text-xs text-gray-400 mb-4">예: 교재비를 먼저 입금하신 경우, 내용을 입력하고 증빙을 첨부해 신청하세요.</p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">항목명 *</label>
                  <input type="text" placeholder="예: 전도학개론 교재비" value={requestForm.title}
                    onChange={e=>setRequestForm({...requestForm,title:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">금액 (원) *</label>
                  <input type="number" placeholder="15000" value={requestForm.amount}
                    onChange={e=>setRequestForm({...requestForm,amount:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">설명 (선택)</label>
                  <input type="text" placeholder="추가 설명" value={requestForm.description}
                    onChange={e=>setRequestForm({...requestForm,description:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">증빙 사진 *</label>
                  <input type="file" accept="image/*"
                    onChange={e=>setRequestFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm"/>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowRequestForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">취소</button>
                <button onClick={handleSubmitRequest} disabled={submittingRequest}
                  className="px-4 py-2 text-sm bg-blue-600 disabled:bg-blue-300 text-white rounded-lg hover:bg-blue-700">
                  {submittingRequest ? '신청 중...' : '신청하기'}
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div
          className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:bg-yellow-100 transition-colors active:scale-[0.99]"
          onClick={() => {
            navigator.clipboard.writeText('3333344408600')
            toast.success('계좌번호가 복사됐어요!')
          }}
        >
          <p className="text-sm font-bold text-yellow-800 mb-1">💳 입금 계좌 <span className="font-normal text-yellow-600">(탭하여 복사)</span></p>
          <p className="text-sm text-yellow-700">카카오뱅크 3333344408600</p>
          <p className="text-sm text-yellow-700">예금주: 강한민</p>
          <p className="text-xs text-yellow-600 mt-1">입금 후 납부 인증 버튼을 눌러주세요!</p>
        </div>
      </div>

      {receiptModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeReceiptModal}>
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="font-bold text-gray-800">납부 증빙 사진</p>
              <button onClick={closeReceiptModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 -m-1">✕</button>
            </div>
            <div className="overflow-y-auto p-4">
              <img src={receiptModal} alt="receipt" className="w-full h-auto rounded-xl"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
