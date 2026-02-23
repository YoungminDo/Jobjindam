import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Bookmark } from 'lucide-react'

export default async function BookmarksPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // 콘텐츠 북마크
  const { data: contentBookmarks } = await supabase
    .from('bookmarks')
    .select('*, content:contents(*)')
    .eq('user_id', user.id)
    .eq('content_type', 'content')
    .order('created_at', { ascending: false })

  // 강의 북마크
  const { data: courseBookmarks } = await supabase
    .from('bookmarks')
    .select('*, course:courses(*)')
    .eq('user_id', user.id)
    .eq('content_type', 'course')
    .order('created_at', { ascending: false })

  const hasBookmarks = (contentBookmarks && contentBookmarks.length > 0) ||
    (courseBookmarks && courseBookmarks.length > 0)

  return (
    <div className="max-w-screen-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Link href="/my" className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-900">북마크</h1>
      </div>

      {!hasBookmarks ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bookmark className="w-12 h-12 mb-3" />
          <p className="text-sm">북마크한 항목이 없습니다</p>
        </div>
      ) : (
        <div>
          {/* 콘텐츠 북마크 */}
          {contentBookmarks && contentBookmarks.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                콘텐츠
              </h3>
              <div className="divide-y divide-gray-100">
                {contentBookmarks.map((bm) => {
                  const content = bm.content as unknown as {
                    id: string
                    title: string
                    summary: string
                    category: string
                  }
                  if (!content) return null
                  return (
                    <Link
                      key={bm.id}
                      href={`/contents/${content.id}`}
                      className="block px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{content.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{content.summary}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* 강의 북마크 */}
          {courseBookmarks && courseBookmarks.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                강의
              </h3>
              <div className="divide-y divide-gray-100">
                {courseBookmarks.map((bm) => {
                  const course = bm.course as unknown as {
                    id: string
                    title: string
                    instructor_name: string
                  }
                  if (!course) return null
                  return (
                    <Link
                      key={bm.id}
                      href={`/courses/${course.id}`}
                      className="block px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{course.instructor_name}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
