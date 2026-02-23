'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  contentId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ contentId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleToggleLike = async () => {
    if (loading) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    // 옵티미스틱 UI 업데이트
    const wasLiked = liked
    const prevCount = count
    setLiked(!wasLiked)
    setCount(wasLiked ? prevCount - 1 : prevCount + 1)
    setLoading(true)

    try {
      if (wasLiked) {
        // 좋아요 취소
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId)

        await supabase
          .from('contents')
          .update({ like_count: prevCount - 1 })
          .eq('id', contentId)
      } else {
        // 좋아요 추가
        await supabase
          .from('likes')
          .insert({ user_id: user.id, content_id: contentId })

        await supabase
          .from('contents')
          .update({ like_count: prevCount + 1 })
          .eq('id', contentId)
      }
    } catch {
      // 실패 시 롤백
      setLiked(wasLiked)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
        liked
          ? 'bg-red-50 text-red-500'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <Heart
        className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`}
      />
      {count}
    </button>
  )
}
