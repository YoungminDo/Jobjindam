import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { ENROLLMENT_STATUS, COURSE_STATUS } from '@/lib/constants'

export default async function MyCoursesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="max-w-screen-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Link href="/my" className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-900">내 수강 목록</h1>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mb-3" />
          <p className="text-sm">수강 중인 강의가 없습니다</p>
          <Link
            href="/courses"
            className="mt-3 text-sm text-primary font-semibold hover:underline"
          >
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {enrollments.map((enrollment) => {
            const course = enrollment.course as unknown as {
              id: string
              title: string
              instructor_name: string
              category: string
              status: string
              duration_weeks: number
            }
            if (!course) return null

            return (
              <Link
                key={enrollment.id}
                href={`/courses/${course.id}`}
                className="block px-4 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {course.instructor_name} · {course.duration_weeks}주
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      enrollment.status === 'applied' ? 'bg-yellow-100 text-yellow-700' :
                      enrollment.status === 'approved' ? 'bg-green-100 text-green-700' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {ENROLLMENT_STATUS[enrollment.status] || enrollment.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {COURSE_STATUS[course.status] || course.status}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
