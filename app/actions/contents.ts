'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function toggleLike(contentId: string) {
  const user = await getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const supabase = await createClient()

  // 기존 좋아요 확인
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single()

  if (existingLike) {
    // 좋아요 취소
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', contentId)

    // like_count 감소
    const { data: content } = await supabase
      .from('contents')
      .select('like_count')
      .eq('id', contentId)
      .single()

    if (content) {
      await supabase
        .from('contents')
        .update({ like_count: Math.max(0, content.like_count - 1) })
        .eq('id', contentId)
    }

    revalidatePath(`/contents/${contentId}`)
    return { liked: false }
  } else {
    // 좋아요 추가
    await supabase
      .from('likes')
      .insert({ user_id: user.id, content_id: contentId })

    // like_count 증가
    const { data: content } = await supabase
      .from('contents')
      .select('like_count')
      .eq('id', contentId)
      .single()

    if (content) {
      await supabase
        .from('contents')
        .update({ like_count: content.like_count + 1 })
        .eq('id', contentId)
    }

    revalidatePath(`/contents/${contentId}`)
    return { liked: true }
  }
}

export async function toggleBookmark(contentId: string, contentType: 'content' | 'course') {
  const user = await getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const supabase = await createClient()

  // 기존 북마크 확인
  let query = supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', contentType)

  if (contentType === 'content') {
    query = query.eq('content_id', contentId)
  } else {
    query = query.eq('course_id', contentId)
  }

  const { data: existingBookmark } = await query.single()

  if (existingBookmark) {
    // 북마크 삭제
    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existingBookmark.id)

    revalidatePath(`/contents/${contentId}`)
    return { bookmarked: false }
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

    revalidatePath(`/contents/${contentId}`)
    return { bookmarked: true }
  }
}
