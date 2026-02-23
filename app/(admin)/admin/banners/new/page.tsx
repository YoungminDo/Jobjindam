import { createClient } from '@/lib/supabase/server'
import BannerForm from '@/components/admin/BannerForm'
import { createHeroBanner } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewBannerPage() {
  const supabase = await createClient()

  const [coursesRes, contentsRes, jobsRes] = await Promise.all([
    supabase.from('courses').select('id, title, instructor_name').order('created_at', { ascending: false }),
    supabase.from('contents').select('id, title, author_name').order('created_at', { ascending: false }),
    supabase.from('job_postings').select('id, title, company_name').order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/banners" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          배너 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">새 배너 등록</h1>
      </div>
      <BannerForm
        courses={(coursesRes.data || []) as any}
        contents={(contentsRes.data || []) as any}
        jobs={(jobsRes.data || []) as any}
        action={createHeroBanner}
        submitLabel="배너 등록"
      />
    </div>
  )
}
