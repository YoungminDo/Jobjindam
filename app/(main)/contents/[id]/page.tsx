import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { Eye, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/features/LikeButton'
import BookmarkButton from '@/components/features/BookmarkButton'
import { CONTENT_CATEGORIES } from '@/lib/constants'
import { notFound } from 'next/navigation'

interface ContentDetailPageProps {
  params: Promise<{ id: string }>
}

function renderBody(body: string) {
  const paragraphs = body.split('\n\n')

  return paragraphs.map((paragraph, index) => {
    // ## 헤더 처리
    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-3">
          {paragraph.replace('## ', '')}
        </h2>
      )
    }

    // 리스트 처리
    if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
      const items = paragraph.split('\n').filter((line) => line.startsWith('- '))
      return (
        <ul key={index} className="list-disc list-inside space-y-1 my-4 text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item.replace('- ', ''))}</li>
          ))}
        </ul>
      )
    }

    // 일반 단락
    return (
      <p key={index} className="text-gray-700 leading-relaxed my-4">
        {renderInlineFormatting(paragraph)}
      </p>
    )
  })
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()

  // 콘텐츠 조회
  const { data: content } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single()

  if (!content) {
    notFound()
  }

  // 조회수 증가
  await supabase
    .from('contents')
    .update({ view_count: content.view_count + 1 })
    .eq('id', id)

  // 사용자 좋아요/북마크 상태 확인
  let hasLiked = false
  let hasBookmarked = false

  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', id)
      .single()

    hasLiked = !!likeData

    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', id)
      .eq('content_type', 'content')
      .single()

    hasBookmarked = !!bookmarkData
  }

  // 카테고리 정보
  const categoryInfo = CONTENT_CATEGORIES.find((c) => c.id === content.category)

  // 날짜 포맷
  const publishedDate = new Date(content.published_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* 뒤로가기 */}
      <Link
        href="/contents"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </Link>

      {/* 뱃지 */}
      <div className="flex items-center gap-2 mb-3">
        {categoryInfo && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {categoryInfo.emoji} {categoryInfo.name}
          </span>
        )}
        {content.is_featured && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            추천
          </span>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h1>

      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
          {content.author_name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{content.author_name}</p>
          {content.author_title && (
            <p className="text-xs text-gray-500">{content.author_title}</p>
          )}
        </div>
      </div>

      {/* 날짜 및 조회수 */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {publishedDate}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          조회 {(content.view_count + 1).toLocaleString()}
        </div>
      </div>

      {/* 본문 */}
      <article className="mb-8">
        {content.body.startsWith('<') ? (
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        ) : (
          renderBody(content.body)
        )}
      </article>

      {/* 태그 */}
      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-100">
          {content.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 좋아요 + 북마크 버튼 */}
      <div className="flex items-center gap-3">
        <LikeButton
          contentId={content.id}
          initialLiked={hasLiked}
          initialCount={content.like_count}
        />
        <BookmarkButton
          contentId={content.id}
          contentType="content"
          initialBookmarked={hasBookmarked}
        />
      </div>
    </div>
  )
}
