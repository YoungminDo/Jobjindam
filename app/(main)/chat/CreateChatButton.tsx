'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateChatButton() {
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 상대방 찾기
    const { data: otherUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!otherUser) {
      setError('해당 이메일의 사용자를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    if (otherUser.id === user.id) {
      setError('자신에게는 메시지를 보낼 수 없습니다.')
      setLoading(false)
      return
    }

    // 채팅방 생성
    const { data: room } = await supabase
      .from('chat_rooms')
      .insert({ type: 'dm', created_by: user.id })
      .select()
      .single()

    if (room) {
      // 참여자 추가
      await supabase.from('chat_participants').insert([
        { room_id: room.id, user_id: user.id },
        { room_id: room.id, user_id: otherUser.id },
      ])

      router.push(`/chat/${room.id}`)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Plus className="w-5 h-5 text-gray-600" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">새 대화</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="상대방 이메일"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition disabled:opacity-50"
              >
                {loading ? '생성 중...' : '대화 시작'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
