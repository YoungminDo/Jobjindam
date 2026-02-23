import { createClient } from '@/lib/supabase/server'
import { COURSE_STATUS, COURSE_CATEGORIES } from '@/lib/constants'
import { Star, Users, Clock, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types/database'
import EnrollButton from './EnrollButton'

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😢</p>
          <p className="text-gray-500 text-sm mb-4">강의를 찾을 수 없습니다</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const typedCourse = course as Course
  const categoryInfo = COURSE_CATEGORIES.find((c) => c.id === typedCourse.category)
  const statusLabel = COURSE_STATUS[typedCourse.status] || typedCourse.status

  // 현재 사용자의 수강 신청 여부 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isEnrolled = false
  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .neq('status', 'canceled')
      .maybeSingle()

    isEnrolled = !!enrollment
  }

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* 뒤로가기 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-gray-600 text-sm hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            강의 목록
          </Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto">
        {/* 썸네일 */}
        <div className="relative aspect-video w-full overflow-hidden">
          {typedCourse.thumbnail_url ? (
            <img
              src={typedCourse.thumbnail_url}
              alt={typedCourse.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-5xl">{categoryInfo?.emoji || '📚'}</span>
            </div>
          )}
          {/* 라이브 뱃지 */}
          {typedCourse.is_live && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* 강의 정보 */}
        <div className="px-4 py-5">
          {/* 뱃지 영역 */}
          <div className="flex items-center gap-2 mb-3">
            {categoryInfo && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${categoryInfo.color}15`,
                  color: categoryInfo.color,
                }}
              >
                {categoryInfo.emoji} {categoryInfo.name}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                typedCourse.status === 'recruiting'
                  ? 'bg-green-50 text-green-600'
                  : typedCourse.status === 'ongoing'
                    ? 'bg-blue-50 text-blue-600'
                    : typedCourse.status === 'closed'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-500'
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {typedCourse.title}
          </h1>

          {/* 강사 정보 */}
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">{typedCourse.instructor_name}</span>
            {typedCourse.instructor_title && (
              <span className="text-gray-400"> | {typedCourse.instructor_title}</span>
            )}
          </p>

          {/* 평점, 리뷰, 수강생 */}
          <div className="flex items-center gap-4 mb-5 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-900">
                {typedCourse.rating.toFixed(1)}
              </span>
              <span className="text-gray-400">({typedCourse.review_count})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span>
                {typedCourse.current_students}/{typedCourse.max_students}명
              </span>
            </div>
          </div>

          {/* 가격 */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-gray-900">
              {typedCourse.price === 0
                ? '무료'
                : `${typedCourse.price.toLocaleString('ko-KR')}원`}
            </span>
          </div>

          {/* 기간, 날짜 정보 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-gray-400">수업 기간</p>
                <p className="text-sm font-medium text-gray-700">
                  {typedCourse.duration_weeks}주
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-gray-400">일정</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(typedCourse.start_date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  ~{' '}
                  {new Date(typedCourse.end_date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-3">강의 소개</h2>
            {typedCourse.description.startsWith('<') ? (
              <div
                className="rich-content text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: typedCourse.description }}
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {typedCourse.description}
              </p>
            )}
          </div>

          {/* 커리큘럼 */}
          {typedCourse.syllabus && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-3">커리큘럼</h2>
              {typeof typedCourse.syllabus === 'string' && (typedCourse.syllabus as string).startsWith('<') ? (
                <div
                  className="rich-content text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: typedCourse.syllabus as unknown as string }}
                />
              ) : Array.isArray(typedCourse.syllabus) && typedCourse.syllabus.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {typedCourse.syllabus.map((item) => (
                    <details
                      key={item.week}
                      className="group bg-gray-50 rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {item.week}
                        </span>
                        <span className="text-sm font-medium text-gray-800 flex-1">
                          {item.title}
                        </span>
                        <span className="text-gray-400 text-xs group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="px-4 pb-3 pl-14">
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* 하단 수강 신청 버튼 (모바일 고정) */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:relative md:border-t-0 md:mt-4">
        <div className="max-w-screen-xl mx-auto">
          <EnrollButton
            courseId={typedCourse.id}
            isEnrolled={isEnrolled}
            isLoggedIn={!!user}
            status={typedCourse.status}
          />
        </div>
      </div>
    </div>
  )
}
