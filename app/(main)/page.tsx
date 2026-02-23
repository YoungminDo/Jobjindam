import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/features/CourseCard'
import ContentCard from '@/components/features/ContentCard'
import JobCard from '@/components/features/JobCard'
import CategoryGrid from '@/components/features/CategoryGrid'
import Carousel from '@/components/features/Carousel'
import HeroBannerCarousel from '@/components/features/HeroBanner'
import { APP_TAGLINE } from '@/lib/constants'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

async function loadFeaturedSection(
  supabase: any,
  section: string,
  table: string,
  idField: string,
  fallbackOrder: string,
  fallbackAsc: boolean,
  limit: number,
  extraFilter?: { field: string; value: any }
) {
  const { data: featured } = await supabase
    .from('featured_items')
    .select(`${idField}, display_order`)
    .eq('section', section)
    .eq('is_active', true)
    .order('display_order')

  if (featured && featured.length > 0) {
    const ids = featured.map((f: any) => f[idField]).filter(Boolean)
    const { data } = await supabase.from(table).select('*').in('id', ids)
    const orderMap = new Map(featured.map((f: any) => [f[idField], f.display_order]))
    let items = (data || []).sort((a: any, b: any) => (orderMap.get(a.id) || 99) - (orderMap.get(b.id) || 99))
    if (items.length < limit) {
      let q = supabase.from(table).select('*')
        .not('id', 'in', `(${items.map((i: any) => i.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .order(fallbackOrder, { ascending: fallbackAsc })
        .limit(limit - items.length)
      if (extraFilter) q = q.eq(extraFilter.field, extraFilter.value)
      const { data: extra } = await q
      if (extra) items = [...items, ...extra]
    }
    return items
  }

  let q = supabase.from(table).select('*').order(fallbackOrder, { ascending: fallbackAsc }).limit(limit)
  if (extraFilter) q = q.eq(extraFilter.field, extraFilter.value)
  const { data } = await q
  return data || []
}

export default async function HomePage() {
  const supabase = await createClient()

  // 모든 섹션을 병렬로 실행
  const [
    { data: heroBanners },
    courses,
    contents,
    jobPostings,
  ] = await Promise.all([
    supabase.from('hero_banners').select('*').eq('is_active', true).order('display_order').limit(5),
    loadFeaturedSection(supabase, 'popular_courses', 'courses', 'course_id', 'rating', false, 6),
    loadFeaturedSection(supabase, 'recommended_contents', 'contents', 'content_id', 'view_count', false, 6),
    loadFeaturedSection(supabase, 'urgent_jobs', 'job_postings', 'job_id', 'deadline', true, 5, { field: 'is_active', value: true }),
  ])

  return (
    <div className="min-h-screen">
      {/* 히어로 배너 */}
      {heroBanners && heroBanners.length > 0 ? (
        <section>
          <HeroBannerCarousel banners={heroBanners} />
        </section>
      ) : (
        /* 배너가 없으면 기본 히어로 */
        <section className="bg-gradient-to-br from-blue-50 to-primary-light px-4 py-12 md:py-20">
          <div className="max-w-screen-xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {APP_TAGLINE}
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-8">
              검증된 강의와 콘텐츠, 실시간 네트워킹까지
            </p>
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition shadow-lg shadow-primary/20"
              >
                무료로 시작하기
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary border border-primary rounded-xl font-semibold hover:bg-primary-light transition"
              >
                강의 둘러보기
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 카테고리 태그 그리드 */}
      <section className="py-6">
        <div className="max-w-screen-xl mx-auto px-4">
          <CategoryGrid />
        </div>
      </section>

      {/* 인기 강의 — 캐러셀 */}
      <section className="py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-4">
            <h2 className="text-lg font-bold text-gray-900">🔥 인기 강의</h2>
            <Link
              href="/courses"
              className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-primary transition"
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {courses && courses.length > 0 ? (
            <div className="pl-4">
              <Carousel itemClassName="w-[240px] md:w-[280px]">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </Carousel>
            </div>
          ) : (
            <div className="mx-4 text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">아직 등록된 강의가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* 추천 콘텐츠 — 캐러셀 */}
      <section className="py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-4">
            <h2 className="text-lg font-bold text-gray-900">📰 추천 콘텐츠</h2>
            <Link
              href="/contents"
              className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-primary transition"
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {contents && contents.length > 0 ? (
            <div className="pl-4">
              <Carousel itemClassName="w-[220px] md:w-[260px]">
                {contents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </Carousel>
            </div>
          ) : (
            <div className="mx-4 text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">아직 등록된 콘텐츠가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* 채용 공고 — 캐러셀 */}
      <section className="py-6 pb-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-4">
            <h2 className="text-lg font-bold text-gray-900">📋 마감 임박 채용</h2>
            <Link
              href="/jobs"
              className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-primary transition"
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {jobPostings && jobPostings.length > 0 ? (
            <div className="pl-4">
              <Carousel itemClassName="w-[300px] md:w-[360px]">
                {jobPostings.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </Carousel>
            </div>
          ) : (
            <div className="mx-4 text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">현재 활성 채용 공고가 없습니다</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
