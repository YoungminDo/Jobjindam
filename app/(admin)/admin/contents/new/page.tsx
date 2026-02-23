import { createClient } from '@/lib/supabase/server'
import ContentForm from '@/components/admin/ContentForm'
import { createContent } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewContentPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('order')

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/contents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          콘텐츠 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">새 콘텐츠 등록</h1>
      </div>
      <ContentForm
        allTags={tags || []}
        initialTagIds={[]}
        action={createContent}
        submitLabel="콘텐츠 등록"
      />
    </div>
  )
}
