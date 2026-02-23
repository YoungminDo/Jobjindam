'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/hooks/useChat'
import ChatMessages from '@/components/features/ChatMessages'
import ChatInput from '@/components/features/ChatInput'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { messages, loading, sendMessage } = useChat(roomId)
  const [currentUserId, setCurrentUserId] = useState('')
  const [roomName, setRoomName] = useState('채팅')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // 채팅방 이름 가져오기
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('name, type')
        .eq('id', roomId)
        .single()

      if (room?.type === 'dm') {
        const { data: others } = await supabase
          .from('chat_participants')
          .select('profiles:profiles!user_id(name)')
          .eq('room_id', roomId)
          .neq('user_id', user.id)
          .limit(1)

        if (others && others.length > 0) {
          const profile = others[0].profiles as unknown as { name: string | null }
          setRoomName(profile?.name || '상대방')
        }
      } else {
        setRoomName(room?.name || '그룹 채팅')
      }
    }

    init()
  }, [roomId, router])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <button onClick={() => router.push('/chat')} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-900 text-sm">{roomName}</h2>
      </div>

      {/* 메시지 영역 */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      )}

      {/* 입력 */}
      <ChatInput onSend={sendMessage} />
    </div>
  )
}
