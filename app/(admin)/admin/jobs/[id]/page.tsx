import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import JobForm from '@/components/admin/JobForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateJob, deleteJob } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [jobRes, tagsRes, jobTagsRes] = await Promise.all([
    supabase.from('job_postings').select('*').eq('id', id).single(),
    supabase.from('tags').select('*').order('order'),
    supabase.from('content_tags').select('tag_id').eq('job_id', id),
  ])

  if (!jobRes.data) notFound()

  const job = jobRes.data
  const tags = tagsRes.data || []
  const initialTagIds = (jobTagsRes.data || []).map((ct) => ct.tag_id)

  const updateAction = updateJob.bind(null, id)
  const deleteAction = deleteJob.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            채용공고 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">채용공고 수정</h1>
        </div>
        <DeleteButton onDelete={deleteAction} label="공고 삭제" />
      </div>
      <JobForm
        job={job}
        allTags={tags}
        initialTagIds={initialTagIds}
        action={updateAction}
        submitLabel="채용공고 수정"
      />
    </div>
  )
}
