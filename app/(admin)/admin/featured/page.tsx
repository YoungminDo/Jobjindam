import { createClient } from '@/lib/supabase/server'
import FeaturedManager from '@/components/admin/FeaturedManager'

export default async function FeaturedPage() {
  const supabase = await createClient()

  // 모든 데이터 병렬 로드
  const [featuredRes, coursesRes, contentsRes, jobsRes] = await Promise.all([
    supabase.from('featured_items').select('*').order('display_order'),
    supabase.from('courses').select('id, title, category, status').order('title'),
    supabase.from('contents').select('id, title, category').order('title'),
    supabase.from('job_postings').select('id, title, company_name, deadline').order('deadline'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">홈 노출 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          인기강의, 추천콘텐츠, 마감임박채용의 홈 노출 순서를 1, 2, 3 순위로 설정하세요.
        </p>
      </div>

      <FeaturedManager
        featuredItems={featuredRes.data || []}
        courses={coursesRes.data || []}
        contents={contentsRes.data || []}
        jobs={jobsRes.data || []}
      />
    </div>
  )
}
