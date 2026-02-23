import { createClient } from '@/lib/supabase/server'
import { TAGS } from '@/lib/constants'
import CourseCard from '@/components/features/CourseCard'
import ContentCard from '@/components/features/ContentCard'
import JobCard from '@/components/features/JobCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag: tagId } = await searchParams
  const tagInfo = TAGS.find((t) => t.id === tagId)

  const supabase = await createClient()

  // 태그에 연결된 아이템 ID들 조회
  const { data: tagRows } = tagId
    ? await supabase.from('content_tags').select('course_id, content_id, job_id, tag_id, tags!inner(name)').eq('tags.name', tagInfo?.name || '')
    : { data: [] }

  const courseIds = (tagRows || []).filter((r) => r.course_id).map((r) => r.course_id!)
  const contentIds = (tagRows || []).filter((r) => r.content_id).map((r) => r.content_id!)
  const jobIds = (tagRows || []).filter((r) => r.job_id).map((r) => r.job_id!)

  // 각 아이템 데이터 로드
  const [coursesRes, contentsRes, jobsRes] = await Promise.all([
    courseIds.length > 0
      ? supabase.from('courses').select('*').in('id', courseIds)
      : Promise.resolve({ data: [] }),
    contentIds.length > 0
      ? supabase.from('contents').select('*').in('id', contentIds)
      : Promise.resolve({ data: [] }),
    jobIds.length > 0
      ? supabase.from('job_postings').select('*').in('id', jobIds)
      : Promise.resolve({ data: [] }),
  ])

  const courses = coursesRes.data || []
  const contents = contentsRes.data || []
  const jobs = jobsRes.data || []
  const totalCount = courses.length + contents.length + jobs.length

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        홈으로
      </Link>

      <div className="flex items-center gap-3 mb-6">
        {tagInfo && <span className="text-3xl">{tagInfo.emoji}</span>}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tagInfo?.name || '검색'}</h1>
          <p className="text-sm text-gray-500">관련 콘텐츠 {totalCount}개</p>
        </div>
      </div>

      {/* 태그 필터 칩 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TAGS.map((t) => (
          <Link
            key={t.id}
            href={`/search?tag=${t.id}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
              t.id === tagId
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
            style={t.id === tagId ? { backgroundColor: t.color } : {}}
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </Link>
        ))}
      </div>

      {totalCount === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-sm">이 태그에 연결된 콘텐츠가 아직 없습니다.</p>
          <p className="text-gray-300 text-xs mt-2">어드민에서 강의/콘텐츠/채용에 태그를 추가해보세요.</p>
        </div>
      )}

      {courses.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎓 강의</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {contents.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📰 콘텐츠</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">💼 채용</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
