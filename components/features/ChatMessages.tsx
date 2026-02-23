'use client'

import { useEffect, useRef } from 'react'
import type { Message, Profile } from '@/types/database'

interface ChatMessage extends Message {
  sender?: Profile
}

interface ChatMessagesProps {
  messages: ChatMessage[]
  currentUserId: string
}

export default function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        대화를 시작해보세요!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId
        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
              {!isMe && (
                <p className="text-xs text-gray-500 mb-1">
                  {msg.sender?.name || '알 수 없음'}
                </p>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : ''}`}>
                {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
