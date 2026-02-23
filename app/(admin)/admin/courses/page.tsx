import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, GraduationCap } from 'lucide-react'
import { COURSE_CATEGORIES, COURSE_STATUS } from '@/lib/constants'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">강의 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {courses?.length ?? 0}개의 강의</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition"
        >
          <Plus className="w-4 h-4" />
          새 강의 등록
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">강의명</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">강사</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">수강생</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">가격</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses?.map((course) => {
              const cat = COURSE_CATEGORIES.find((c) => c.id === course.category)
              return (
                <tr key={course.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{course.title}</p>
                        {course.is_live && (
                          <span className="text-xs text-red-500 font-medium">LIVE</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{cat?.emoji} {cat?.name || course.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{course.instructor_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{course.current_students}/{course.max_students}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'recruiting' ? 'bg-green-100 text-green-700' :
                      course.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                      course.status === 'closed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {COURSE_STATUS[course.status] || course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {course.price === 0 ? '무료' : `${course.price.toLocaleString()}원`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary-light rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      편집
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!courses || courses.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  등록된 강의가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
