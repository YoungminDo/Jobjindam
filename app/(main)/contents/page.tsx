import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/features/ContentCard'
import { CONTENT_CATEGORIES } from '@/lib/constants'
import Link from 'next/link'

interface ContentsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ContentsPage({ searchParams }: ContentsPageProps) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contents')
    .select('*')
    .order('published_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: contents } = await query

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">콘텐츠</h1>

      {/* 카테고리 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <Link
          href="/contents"
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            !category
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </Link>
        {CONTENT_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/contents?category=${cat.id}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.emoji} {cat.name}
          </Link>
        ))}
      </div>

      {/* 콘텐츠 그리드 */}
      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 text-sm">아직 등록된 콘텐츠가 없습니다</p>
        </div>
      )}
    </div>
  )
}
