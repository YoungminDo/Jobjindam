'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile } from '@/types/database'

interface ChatMessage extends Message {
  sender?: Profile
}

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 기존 메시지 로드
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (data) {
        setMessages(data as ChatMessage[])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [roomId, supabase])

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // sender 프로필 가져오기
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender: ChatMessage = {
            ...newMessage,
            sender: sender || undefined,
          }

          setMessages((prev) => [...prev, messageWithSender])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('messages').insert({
        room_id: roomId,
        sender_id: user.id,
        content,
        message_type: 'text',
      })
    },
    [roomId, supabase]
  )

  return { messages, loading, sendMessage }
}
