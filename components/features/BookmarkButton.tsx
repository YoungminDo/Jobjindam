'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BookmarkButtonProps {
  contentId: string
  contentType: 'content' | 'course'
  initialBookmarked: boolean
}

export default function BookmarkButton({
  contentId,
  contentType,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const handleToggleBookmark = async () => {
    if (loading) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    // 옵티미스틱 UI 업데이트
    const wasBookmarked = bookmarked
    setBookmarked(!wasBookmarked)
    setLoading(true)

    try {
      if (wasBookmarked) {
        // 북마크 삭제
        const deleteQuery = supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_type', contentType)

        if (contentType === 'content') {
          deleteQuery.eq('content_id', contentId)
        } else {
          deleteQuery.eq('course_id', contentId)
        }

        await deleteQuery
      } else {
        // 북마크 추가
        const insertData: Record<string, string> = {
          user_id: user.id,
          content_type: contentType,
        }

        if (contentType === 'content') {
          insertData.content_id = contentId
        } else {
          insertData.course_id = contentId
        }

        await supabase.from('bookmarks').insert(insertData)
      }
    } catch {
      // 실패 시 롤백
      setBookmarked(wasBookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
        bookmarked
          ? 'bg-blue-50 text-blue-500'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <Bookmark
        className={`w-4 h-4 ${bookmarked ? 'fill-blue-500 text-blue-500' : ''}`}
      />
      {bookmarked ? '저장됨' : '저장'}
    </button>
  )
}
