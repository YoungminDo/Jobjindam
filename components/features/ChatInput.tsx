'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (content: string) => void
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    onSend(trimmed)
    setMessage('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 px-4 py-3 bg-white flex items-center gap-2"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="p-2 rounded-full bg-primary text-white disabled:opacity-30 hover:bg-primary-hover transition"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
