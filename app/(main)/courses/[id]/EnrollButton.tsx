'use client'

import { useState, useTransition } from 'react'
import { enrollCourse, cancelEnrollment } from '@/app/actions/courses'
import { useRouter } from 'next/navigation'

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
  isLoggedIn: boolean
  status: string
}

export default function EnrollButton({
  courseId,
  isEnrolled,
  isLoggedIn,
  status,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const router = useRouter()

  const handleEnroll = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    startTransition(async () => {
      const result = await enrollCourse(courseId)
      if (result.error) {
        setMessageType('error')
        setMessage(result.error)
      } else {
        setMessageType('success')
        setMessage(result.message || '수강 신청이 완료되었습니다!')
      }
      // 메시지를 3초 후 자동으로 숨기기
      setTimeout(() => setMessage(null), 3000)
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelEnrollment(courseId)
      if (result.error) {
        setMessageType('error')
        setMessage(result.error)
      } else {
        setMessageType('success')
        setMessage(result.message || '수강 신청이 취소되었습니다.')
      }
      setTimeout(() => setMessage(null), 3000)
    })
  }

  // 모집 중이 아닌 경우
  if (status !== 'recruiting' && !isEnrolled) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-xl text-base font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        {status === 'closed' ? '모집 마감' : status === 'ongoing' ? '진행 중' : '종료된 강의'}
      </button>
    )
  }

  return (
    <div>
      {/* 알림 메시지 */}
      {message && (
        <div
          className={`mb-3 px-4 py-2.5 rounded-xl text-sm font-medium text-center ${
            messageType === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}
        >
          {message}
        </div>
      )}

      {isEnrolled ? (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl text-base font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '처리 중...' : '수강 취소하기'}
        </button>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl text-base font-semibold bg-primary text-white hover:bg-primary-hover transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '처리 중...' : '수강 신청하기'}
        </button>
      )}
    </div>
  )
}
