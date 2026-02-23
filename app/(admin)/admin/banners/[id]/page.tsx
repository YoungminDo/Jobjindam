import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BannerForm from '@/components/admin/BannerForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateHeroBanner, deleteHeroBanner } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [bannerRes, coursesRes, contentsRes, jobsRes] = await Promise.all([
    supabase.from('hero_banners').select('*').eq('id', id).single(),
    supabase.from('courses').select('id, title, instructor_name').order('created_at', { ascending: false }),
    supabase.from('contents').select('id, title, author_name').order('created_at', { ascending: false }),
    supabase.from('job_postings').select('id, title, company_name').order('created_at', { ascending: false }),
  ])

  if (!bannerRes.data) notFound()

  const banner = bannerRes.data
  const updateAction = updateHeroBanner.bind(null, id)
  const deleteAction = deleteHeroBanner.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/banners" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            배너 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">배너 수정</h1>
        </div>
        <DeleteButton onDelete={deleteAction} label="배너 삭제" />
      </div>
      <BannerForm
        banner={banner}
        courses={(coursesRes.data || []) as any}
        contents={(contentsRes.data || []) as any}
        jobs={(jobsRes.data || []) as any}
        action={updateAction}
        submitLabel="배너 수정"
      />
    </div>
  )
}
