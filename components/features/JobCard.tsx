import { MapPin, Calendar, ExternalLink } from 'lucide-react'
import type { JobPosting } from '@/types/database'

const jobTypeLabels: Record<string, { label: string; color: string }> = {
  newgrad: { label: '신입 공채', color: 'bg-blue-100 text-blue-700' },
  intern: { label: '인턴십', color: 'bg-green-100 text-green-700' },
  experienced: { label: '수시 채용', color: 'bg-orange-100 text-orange-700' },
}

const companyColors: Record<string, { gradient: string; letter: string }> = {
  카카오: { gradient: 'from-yellow-400 to-amber-500', letter: 'K' },
  네이버: { gradient: 'from-green-400 to-emerald-500', letter: 'N' },
  삼성전자: { gradient: 'from-blue-500 to-indigo-600', letter: 'S' },
  토스: { gradient: 'from-blue-400 to-cyan-500', letter: 'T' },
  'CJ ENM': { gradient: 'from-red-400 to-rose-500', letter: 'CJ' },
}

const defaultCompany = { gradient: 'from-gray-400 to-gray-500', letter: '?' }

function getDday(deadline: string): { text: string; urgent: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: '마감', urgent: false }
  if (diff === 0) return { text: 'D-Day', urgent: true }
  return { text: `D-${diff}`, urgent: diff <= 7 }
}

export default function JobCard({ job }: { job: JobPosting }) {
  const { text: dday, urgent } = getDday(job.deadline)
  const typeInfo = jobTypeLabels[job.job_type] || { label: job.job_type, color: 'bg-gray-100 text-gray-600' }
  const company = companyColors[job.company_name] || defaultCompany
  const isExpired = dday === '마감'

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${isExpired ? 'opacity-50' : ''}`}>
      <div className="flex">
        {/* 좌측 — 기업 로고 비주얼 */}
        <div className={`w-24 shrink-0 bg-gradient-to-br ${company.gradient} flex flex-col items-center justify-center py-4`}>
          <span className="text-white text-xl font-black">{company.letter}</span>
          <span className="text-white/70 text-[9px] mt-0.5 font-medium">{job.company_name}</span>
        </div>

        {/* 우측 — 정보 */}
        <div className="flex-1 p-3.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <span className={`text-[11px] font-bold ${urgent ? 'text-red-500' : isExpired ? 'text-gray-400' : 'text-primary'}`}>
                  {dday}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{job.title}</h3>
            </div>

            {job.url && !isExpired && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-1.5 rounded-full bg-primary-light hover:bg-primary text-primary hover:text-white transition"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* 위치 + 마감일 */}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
            {job.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              ~{new Date(job.deadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* 태그 */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
