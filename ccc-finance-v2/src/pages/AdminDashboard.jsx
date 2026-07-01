import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('payments')
  const [payments, setPayments] = useState([])
  const [items, setItems] = useState([])
  const [members, setMembers] = useState([])
  const [admins, setAdmins] = useState([])
  const [expandedItem, setExpandedItem] = useState(null)
  const [receiptModal, setReceiptModal] = useState(null)

  // 항목 추가 폼
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemForm, setItemForm] = useState({ title: '', amount: '', description: '' })
  const [selectedMembers, setSelectedMembers] = useState([])

  // 관리자 추가 폼
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', role: 'subadmin' })

  // 가입자 추가 폼
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', student_id: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: p }, { data: i }, { data: m }, { data: a }] = await Promise.all([
      supabase.from('payments').select('*, profiles(name, student_id), payment_items(title, amount)').order('created_at', { ascending: false }),
      supabase.from('payment_items').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'member').order('name'),
      supabase.from('profiles').select('*').in('role', ['admin', 'subadmin']).order('name'),
    ])
    setPayments(p || [])
    setItems(i || [])
    setMembers(m || [])
    setAdmins(a || [])
  }

  // 통계
  const pendingPays = payments.filter(p => p.status === 'pending')
  const totalCollected = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + (p.payment_items?.amount || 0), 0)

  async function updatePayStatus(payId, status) {
    await supabase.from('payments').update({ status, confirmed_at: new Date().toISOString() }).eq('id', payId)
    toast.success(status === 'confirmed' ? '납부 확인 완료! ✅' : '반려했습니다')
    fetchAll()
  }

  async function createItem() {
    if (!itemForm.title) return toast.error('항목명을 입력해주세요')
    if (!itemForm.amount) return toast.error('금액을 입력해주세요')
    if (!selectedMembers.length) return toast.error('납부 대상을 선택해주세요')
    const { error } = await supabase.from('payment_items').insert({
      title: itemForm.title, amount: parseInt(itemForm.amount),
      description: itemForm.description, target_ids: selectedMembers,
    })
    if (error) return toast.error('오류가 발생했습니다')
    toast.success('항목이 생성됐습니다 ✅')
    setShowItemForm(false)
    setItemForm({ title: '', amount: '', description: '' })
    setSelectedMembers([])
    fetchAll()
  }

  async function deleteItem(itemId) {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    await supabase.from('payments').delete().eq('item_id', itemId)
    await supabase.from('payment_items').delete().eq('id', itemId)
    toast.success('삭제됐습니다')
    fetchAll()
  }

  async function addMember() {
    if (!memberForm.name.trim()) return toast.error('이름을 입력해주세요')
    const { error } = await supabase.from('profiles').insert({
      name: memberForm.name.trim(), student_id: memberForm.student_id.trim(), role: 'member'
    })
    if (error) return toast.error('오류가 발생했습니다')
    toast.success(memberForm.name + '님이 추가됐습니다 ✅')
    setShowMemberForm(false)
    setMemberForm({ name: '', student_id: '' })
    fetchAll()
  }

  async function deleteMember(memberId) {
    if (!confirm('이 가입자를 삭제하시겠습니까?')) return
    await supabase.from('profiles').delete().eq('id', memberId)
    toast.success('삭제됐습니다')
    fetchAll()
  }

  async function addAdmin() {
    if (!adminForm.name.trim()) return toast.error('이름을 입력해주세요')
    const existing = members.find(m => m.name === adminForm.name.trim())
    if (existing) {
      await supabase.from('profiles').update({ role: adminForm.role }).eq('id', existing.id)
    } else {
      await supabase.from('profiles').insert({ name: adminForm.name.trim(), role: adminForm.role })
    }
    toast.success(adminForm.name + '님이 관리자로 추가됐습니다 ✅')
    setShowAdminForm(false)
    setAdminForm({ name: '', role: 'subadmin' })
    fetchAll()
  }

  async function deleteAdmin(adminId) {
    if (adminId === user.id) return toast.error('본인은 삭제할 수 없습니다')
    if (!confirm('이 관리자를 삭제하시겠습니까?')) return
    await supabase.from('profiles').update({ role: 'member' }).eq('id', adminId)
    toast.success('삭제됐습니다')
    fetchAll()
  }

  function toggleMember(id) {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const tabStyle = (t) => tab === t
    ? 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white'
    : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{totalCollected.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">총 수납액 (원)</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-500">{pendingPays.length}</p>
            <p className="text-xs text-gray-500 mt-1">확인 대기</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-700">{members.length}</p>
            <p className="text-xs text-gray-500 mt-1">전체 가입자</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={()=>setTab('payments')} className={tabStyle('payments')}>
            납부 관리{pendingPays.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingPays.length}</span>}
          </button>
          <button onClick={()=>setTab('items')} className={tabStyle('items')}>항목 관리</button>
          <button onClick={()=>setTab('members')} className={tabStyle('members')}>가입자 명단</button>
          <button onClick={()=>setTab('admins')} className={tabStyle('admins')}>관리자 관리</button>
        </div>

        {/* 납부 관리 */}
        {tab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400">납부 신청 내역이 없습니다</div>}
            {[...payments].sort((a,b)=>({pending:0,rejected:1,confirmed:2}[a.status]-{pending:0,rejected:1,confirmed:2}[b.status])).map(pay => (
              <div key={pay.id} className={`bg-white rounded-xl shadow-sm border p-4 ${pay.status==='pending'?'border-yellow-200':'border-gray-100'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{pay.profiles?.name}</span>
                      {pay.profiles?.student_id && <span className="text-xs text-gray-400">{pay.profiles.student_id}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pay.status==='confirmed'?'bg-green-100 text-green-700':pay.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                        {pay.status==='confirmed'?'완료':pay.status==='pending'?'대기':'반려'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{pay.payment_items?.title} · {pay.payment_items?.amount?.toLocaleString()}원</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(pay.created_at).toLocaleString('ko-KR')} 신청</p>
                  </div>
                  {pay.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>updatePayStatus(pay.id,'confirmed')} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg">
                        <CheckCircle size={14}/>확인
                      </button>
                      <button onClick={()=>updatePayStatus(pay.id,'rejected')} className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm px-3 py-1.5 rounded-lg">
                        <XCircle size={14}/>반려
                      </button>
                    </div>
                  )}
                </div>
                {pay.receipt_url && (
                  <button onClick={()=>setReceiptModal(pay.receipt_url)} className="mt-2 text-sm text-blue-500 hover:underline">📎 납부 증빙 사진 보기</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 항목 관리 */}
        {tab === 'items' && (
          <div>
            <button onClick={()=>setShowItemForm(!showItemForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
              <Plus size={16}/>새 납부 항목 추가
            </button>

            {showItemForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
                <h3 className="font-bold text-gray-700 mb-3">납부 항목 추가</h3>
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">항목명 *</label>
                      <input type="text" placeholder="여름 수련회비" value={itemForm.title}
                        onChange={e=>setItemForm({...itemForm,title:e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">금액 (원) *</label>
                      <input type="number" placeholder="50000" value={itemForm.amount}
                        onChange={e=>setItemForm({...itemForm,amount:e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">설명 (선택)</label>
                    <input type="text" placeholder="추가 안내사항" value={itemForm.description}
                      onChange={e=>setItemForm({...itemForm,description:e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-gray-600">납부 대상 선택 * ({selectedMembers.length}명 선택)</label>
                    <div className="flex gap-2">
                      <button onClick={()=>setSelectedMembers(members.map(m=>m.id))} className="text-xs text-blue-500 hover:underline">전체 선택</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={()=>setSelectedMembers([])} className="text-xs text-gray-400 hover:underline">전체 해제</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                    {members.map(m => (
                      <button key={m.id} onClick={()=>toggleMember(m.id)}
                        className={`text-sm px-2 py-1.5 rounded-lg border transition-colors ${selectedMembers.includes(m.id)?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={()=>{setShowItemForm(false);setSelectedMembers([])}} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">취소</button>
                  <button onClick={createItem} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">생성</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {items.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400">납부 항목이 없습니다</div>}
              {items.map(item => {
                const itemPays = payments.filter(p => p.item_id === item.id)
                const confirmedPays = itemPays.filter(p => p.status === 'confirmed')
                const targetCount = item.target_ids?.length || 0
                const pct = targetCount ? Math.round(confirmedPays.length / targetCount * 100) : 0
                const confirmedNames = confirmedPays.map(p => p.profiles?.name)
                const targetMembers = members.filter(m => item.target_ids?.includes(m.id))
                const unpaidMembers = targetMembers.filter(m => !confirmedNames.includes(m.name))
                const isExpanded = expandedItem === item.id

                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{item.title}</h3>
                          <p className="text-blue-600 font-semibold">{item.amount.toLocaleString()}원</p>
                          {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">대상: {targetCount}명</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{confirmedPays.length}/{targetCount}명 납부</span>
                          <button onClick={()=>setExpandedItem(isExpanded?null:item.id)} className="p-1 hover:bg-gray-100 rounded">
                            {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                          </button>
                          <button onClick={()=>deleteItem(item.id)} className="p-1 hover:bg-red-50 text-red-400 rounded">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 rounded-full h-1.5 transition-all" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-2">✅ 납부 완료 ({confirmedNames.length}명)</p>
                            {confirmedNames.length ? confirmedNames.map((n,i)=><p key={i} className="text-sm text-gray-700">{n}</p>) : <p className="text-sm text-gray-300">없음</p>}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-2">❌ 미납부 ({unpaidMembers.length}명)</p>
                            {unpaidMembers.length ? unpaidMembers.map(m=><p key={m.id} className="text-sm text-gray-400">{m.name}</p>) : <p className="text-sm text-green-500 font-medium">전원 납부!</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 가입자 명단 */}
        {tab === 'members' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <p className="font-bold text-gray-700">👥 가입자 명단 ({members.length}명)</p>
              <span className="text-xs text-gray-400">로그인 시 자동 등록됩니다</span>
            </div>
            <div className="divide-y divide-gray-50">
              {members.map(m => {
                return (
                  <div key={m.id} className="p-4 flex justify-between items-center">
                    <div><p className="font-medium text-gray-800">{m.name}</p>{m.student_id&&<p className="text-xs text-gray-400">{m.student_id}</p>}</div>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>deleteMember(m.id)} className="text-xs text-red-300 hover:text-red-500">삭제</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 관리자 관리 */}
        {tab === 'admins' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-700">🔑 관리자 관리</p>
                <p className="text-xs text-gray-400 mt-0.5">부관리자는 관리자와 동일한 권한을 가집니다</p>
              </div>
              <button onClick={()=>setShowAdminForm(true)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">+ 관리자 추가</button>
            </div>
            {showAdminForm && (
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <input type="text" placeholder="이름 *" value={adminForm.name}
                    onChange={e=>setAdminForm({...adminForm,name:e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <select value={adminForm.role} onChange={e=>setAdminForm({...adminForm,role:e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="admin">관리자</option>
                    <option value="subadmin">부관리자</option>
                  </select>
                  <button onClick={addAdmin} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">추가</button>
                  <button onClick={()=>setShowAdminForm(false)} className="px-3 py-2 text-gray-400 hover:bg-gray-200 text-sm rounded-lg">취소</button>
                </div>
              </div>
            )}
            <div className="divide-y divide-gray-50">
              {admins.map(a => (
                <div key={a.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${a.role==='admin'?'bg-blue-100':'bg-gray-100'}`}>
                      <span>{a.role==='admin'?'🔑':'🔒'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{a.name}</p>
                      <p className={`text-xs ${a.role==='admin'?'text-blue-500':'text-gray-400'}`}>{a.role==='admin'?'관리자':'부관리자'}</p>
                    </div>
                  </div>
                  {a.id !== user.id
                    ? <button onClick={()=>deleteAdmin(a.id)} className="text-xs text-red-300 hover:text-red-500">삭제</button>
                    : <span className="text-xs text-gray-300">본인</span>}
                </div>
              ))}
            </div>
          </div>
        )}

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
