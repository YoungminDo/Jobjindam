import { createClient } from '@/lib/supabase/server'
import CourseForm from '@/components/admin/CourseForm'
import { createCourse } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('order')

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          강의 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">새 강의 등록</h1>
      </div>
      <CourseForm
        allTags={tags || []}
        initialTagIds={[]}
        action={createCourse}
        submitLabel="강의 등록"
      />
    </div>
  )
}
