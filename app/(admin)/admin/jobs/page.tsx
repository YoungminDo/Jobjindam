import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Briefcase } from 'lucide-react'
import { JOB_TYPES } from '@/lib/constants'

export default async function AdminJobsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">채용공고 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {jobs?.length ?? 0}개의 공고</p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
        >
          <Plus className="w-4 h-4" />
          새 채용공고 등록
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">회사명</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">제목</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">근무지</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">마감일</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">활성</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs?.map((job) => {
              const jobType = JOB_TYPES.find((t) => t.id === job.job_type)
              const daysLeft = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <tr key={job.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{job.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1">{job.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {jobType?.name || job.job_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{job.location || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-gray-600'}`}>
                      {daysLeft > 0 ? `D-${daysLeft}` : '마감'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block w-2 h-2 rounded-full ${job.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      편집
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!jobs || jobs.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  등록된 채용공고가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
