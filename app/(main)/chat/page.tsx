import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import Link from 'next/link'
import { MessageCircle, Plus } from 'lucide-react'
import CreateChatButton from './CreateChatButton'

export default async function ChatListPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // 내가 참여한 채팅방 목록
  const { data: participations } = await supabase
    .from('chat_participants')
    .select('room_id')
    .eq('user_id', user.id)

  const roomIds = participations?.map((p) => p.room_id) || []

  let rooms: Array<{
    id: string
    type: string
    name: string | null
    created_at: string
    lastMessage?: string
    lastMessageTime?: string
    otherUser?: string
  }> = []

  if (roomIds.length > 0) {
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: false })

    if (chatRooms) {
      rooms = await Promise.all(
        chatRooms.map(async (room) => {
          // 마지막 메시지
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // DM이면 상대방 이름 찾기
          let otherUser = room.name
          if (room.type === 'dm') {
            const { data: others } = await supabase
              .from('chat_participants')
              .select('user_id, profiles:profiles!user_id(name)')
              .eq('room_id', room.id)
              .neq('user_id', user.id)
              .limit(1)

            if (others && others.length > 0) {
              const profile = others[0].profiles as unknown as { name: string | null }
              otherUser = profile?.name || '알 수 없음'
            }
          }

          return {
            ...room,
            lastMessage: lastMsg?.content,
            lastMessageTime: lastMsg?.created_at,
            otherUser: otherUser || undefined,
          }
        })
      )
    }
  }

  return (
    <div className="max-w-screen-md mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">채팅</h1>
        <CreateChatButton />
      </div>

      {/* 채팅방 목록 */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MessageCircle className="w-12 h-12 mb-3" />
          <p className="text-sm">아직 대화가 없습니다</p>
          <p className="text-xs mt-1">새로운 대화를 시작해보세요</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/chat/${room.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {room.otherUser || room.name || '채팅방'}
                  </p>
                  {room.lastMessageTime && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(room.lastMessageTime).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {room.lastMessage || '새로운 대화'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
