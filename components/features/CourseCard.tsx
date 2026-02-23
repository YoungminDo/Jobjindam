import Link from 'next/link'
import { Star, Users, Clock, Radio } from 'lucide-react'
import type { Course } from '@/types/database'
import { COURSE_STATUS } from '@/lib/constants'

const statusColors: Record<string, string> = {
  recruiting: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-600',
  ongoing: 'bg-blue-100 text-blue-700',
  finished: 'bg-gray-100 text-gray-500',
}

const categoryVisuals: Record<string, { gradient: string; emoji: string; pattern: string }> = {
  resume: {
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    emoji: '📝',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  interview: {
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    emoji: '💼',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  coding: {
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    emoji: '💻',
    pattern: 'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  portfolio: {
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    emoji: '🎨',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  skill: {
    gradient: 'from-purple-400 via-violet-500 to-indigo-600',
    emoji: '📊',
    pattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  attitude: {
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    emoji: '🌟',
    pattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
}

const defaultVisual = {
  gradient: 'from-gray-400 via-gray-500 to-gray-600',
  emoji: '🎓',
  pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
}

export default function CourseCard({ course }: { course: Course }) {
  const visual = categoryVisuals[course.category] || defaultVisual

  return (
    <Link
      href={`/courses/${course.id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* 썸네일 — 비주얼 그라데이션 */}
      <div
        className={`relative h-40 bg-gradient-to-br ${visual.gradient} flex items-center justify-center overflow-hidden`}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: visual.pattern }}
        />
        {/* 장식 원 */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

        <span className="text-5xl relative z-10 drop-shadow-lg">{visual.emoji}</span>

        {course.is_live && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-semibold rounded-full backdrop-blur-sm ${statusColors[course.status] || 'bg-gray-100 text-gray-500'}`}>
          {COURSE_STATUS[course.status] || course.status}
        </span>

        {/* 가격 오버레이 */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-lg">
          <span className="text-white text-xs font-bold">
            {course.price === 0 ? '무료' : `${course.price.toLocaleString()}원`}
          </span>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-3.5">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5">{course.instructor_name}</p>

        {/* 평점 + 수강생 + 기간 */}
        <div className="flex items-center gap-2.5 mt-2.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-0.5 text-amber-500 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {Number(course.rating).toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5">
            <Users className="w-3 h-3" />
            {course.current_students}명
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {course.duration_weeks}주
          </span>
        </div>
      </div>
    </Link>
  )
}
