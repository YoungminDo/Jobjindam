import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ContentForm from '@/components/admin/ContentForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateContent, deleteContent } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [contentRes, tagsRes, contentTagsRes] = await Promise.all([
    supabase.from('contents').select('*').eq('id', id).single(),
    supabase.from('tags').select('*').order('order'),
    supabase.from('content_tags').select('tag_id').eq('content_id', id),
  ])

  if (!contentRes.data) notFound()

  const content = contentRes.data
  const tags = tagsRes.data || []
  const initialTagIds = (contentTagsRes.data || []).map((ct) => ct.tag_id)

  const updateAction = updateContent.bind(null, id)
  const deleteAction = deleteContent.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/contents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            콘텐츠 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 수정</h1>
        </div>
        <DeleteButton onDelete={deleteAction} label="콘텐츠 삭제" />
      </div>
      <ContentForm
        content={content}
        allTags={tags}
        initialTagIds={initialTagIds}
        action={updateAction}
        submitLabel="콘텐츠 수정"
      />
    </div>
  )
}
