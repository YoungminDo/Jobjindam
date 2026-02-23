import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/features/JobCard'
import { JOB_TYPES } from '@/lib/constants'
import Link from 'next/link'

interface JobsPageProps {
  searchParams: Promise<{ job_type?: string }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { job_type } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('job_postings')
    .select('*')
    .eq('is_active', true)
    .order('deadline', { ascending: true })

  if (job_type) {
    query = query.eq('job_type', job_type)
  }

  const { data: jobs } = await query

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">채용 공고</h1>

      {/* 채용 유형 필터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <Link
          href="/jobs"
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            !job_type
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </Link>
        {JOB_TYPES.map((type) => (
          <Link
            key={type.id}
            href={`/jobs?job_type=${type.id}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              job_type === type.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.name}
          </Link>
        ))}
      </div>

      {/* 채용 공고 리스트 */}
      {jobs && jobs.length > 0 ? (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 text-sm">현재 등록된 채용 공고가 없습니다</p>
        </div>
      )}
    </div>
  )
}
