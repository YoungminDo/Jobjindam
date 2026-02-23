import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CourseForm from '@/components/admin/CourseForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateCourse, deleteCourse } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [courseRes, tagsRes, courseTagsRes] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).single(),
    supabase.from('tags').select('*').order('order'),
    supabase.from('content_tags').select('tag_id').eq('course_id', id),
  ])

  if (!courseRes.data) notFound()

  const course = courseRes.data
  const tags = tagsRes.data || []
  const initialTagIds = (courseTagsRes.data || []).map((ct) => ct.tag_id)

  const updateAction = updateCourse.bind(null, id)
  const deleteAction = deleteCourse.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            강의 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">강의 수정</h1>
        </div>
        <DeleteButton onDelete={deleteAction} label="강의 삭제" />
      </div>
      <CourseForm
        course={course}
        allTags={tags}
        initialTagIds={initialTagIds}
        action={updateAction}
        submitLabel="강의 수정"
      />
    </div>
  )
}
