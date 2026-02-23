import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/features/CourseCard'
import { COURSE_CATEGORIES } from '@/lib/constants'
import Link from 'next/link'

interface CoursesPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { category } = await searchParams
  const supabase = await createClient()

  // 카테고리 필터 적용
  let query = supabase.from('courses').select('*').order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: courses } = await query

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">강의</h1>
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <Link
              href="/courses"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                !category
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </Link>
            {COURSE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="px-4 py-6">
        <div className="max-w-screen-xl mx-auto">
          {courses && courses.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                총 <span className="font-semibold text-gray-700">{courses.length}</span>개의 강의
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">
                {category
                  ? COURSE_CATEGORIES.find((c) => c.id === category)?.emoji || '📚'
                  : '📚'}
              </div>
              <p className="text-gray-500 text-sm mb-2">
                {category
                  ? `${COURSE_CATEGORIES.find((c) => c.id === category)?.name || ''} 카테고리에 등록된 강의가 없습니다`
                  : '아직 등록된 강의가 없습니다'}
              </p>
              <p className="text-gray-400 text-xs">새로운 강의가 곧 등록될 예정입니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
