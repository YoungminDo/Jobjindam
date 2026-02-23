import Link from 'next/link'
import { Eye, Heart, Award } from 'lucide-react'
import type { Content } from '@/types/database'

const categoryVisuals: Record<string, { gradient: string; emoji: string }> = {
  success_story: { gradient: 'from-yellow-400 via-amber-500 to-orange-500', emoji: '🎉' },
  interview_questions: { gradient: 'from-cyan-400 via-blue-500 to-indigo-500', emoji: '❓' },
  resume_review: { gradient: 'from-violet-400 via-purple-500 to-fuchsia-500', emoji: '✏️' },
  industry_analysis: { gradient: 'from-emerald-400 via-green-500 to-teal-500', emoji: '📈' },
  trend_report: { gradient: 'from-rose-400 via-pink-500 to-red-500', emoji: '🔥' },
}

const defaultVisual = { gradient: 'from-gray-400 via-gray-500 to-gray-600', emoji: '📰' }

export default function ContentCard({ content }: { content: Content }) {
  const visual = categoryVisuals[content.category] || defaultVisual

  return (
    <Link
      href={`/contents/${content.id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* 썸네일 — 비주얼 그라데이션 */}
      <div
        className={`relative h-36 bg-gradient-to-br ${visual.gradient} flex items-center justify-center overflow-hidden`}
      >
        {/* 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <span className="text-5xl relative z-10 drop-shadow-lg">{visual.emoji}</span>

        {content.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-amber-600 text-[10px] font-bold rounded-full shadow">
            <Award className="w-3 h-3" /> 추천
          </span>
        )}

        {/* 카테고리 오버레이 */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
          <span className="text-white text-[10px] font-medium">{content.category}</span>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-3.5">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition leading-snug">
          {content.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{content.summary}</p>

        {/* 작성자 + 통계 */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-gray-500 truncate">
            {content.author_name}
          </p>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 shrink-0">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {content.view_count >= 1000
                ? `${(content.view_count / 1000).toFixed(1)}k`
                : content.view_count}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              {content.like_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
