'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollCourse(courseId: string) {
  const supabase = await createClient()

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 이미 수강 신청했는지 확인
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing && existing.status !== 'canceled') {
    return { error: '이미 수강 신청한 강의입니다.' }
  }

  // 강의 정보 확인 (정원 초과 여부)
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, max_students, current_students, status')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    return { error: '강의 정보를 찾을 수 없습니다.' }
  }

  if (course.status !== 'recruiting') {
    return { error: '현재 모집 중인 강의가 아닙니다.' }
  }

  if (course.current_students >= course.max_students) {
    return { error: '정원이 마감되었습니다.' }
  }

  // 수강 신청 등록
  const { error: enrollError } = await supabase.from('enrollments').insert({
    user_id: user.id,
    course_id: courseId,
    status: 'applied',
  })

  if (enrollError) {
    return { error: '수강 신청에 실패했습니다. 다시 시도해 주세요.' }
  }

  // 현재 수강생 수 증가
  const { error: updateError } = await supabase
    .from('courses')
    .update({ current_students: course.current_students + 1 })
    .eq('id', courseId)

  if (updateError) {
    return { error: '수강생 수 업데이트에 실패했습니다.' }
  }

  revalidatePath(`/courses/${courseId}`)
  revalidatePath('/courses')

  return { success: true, message: '수강 신청이 완료되었습니다!' }
}

export async function cancelEnrollment(courseId: string) {
  const supabase = await createClient()

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 수강 신청 내역 확인
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .neq('status', 'canceled')
    .maybeSingle()

  if (enrollmentError || !enrollment) {
    return { error: '수강 신청 내역을 찾을 수 없습니다.' }
  }

  // 수강 신청 취소
  const { error: cancelError } = await supabase
    .from('enrollments')
    .update({ status: 'canceled' })
    .eq('id', enrollment.id)

  if (cancelError) {
    return { error: '수강 취소에 실패했습니다. 다시 시도해 주세요.' }
  }

  // 현재 수강생 수 감소
  const { data: course } = await supabase
    .from('courses')
    .select('current_students')
    .eq('id', courseId)
    .single()

  if (course && course.current_students > 0) {
    await supabase
      .from('courses')
      .update({ current_students: course.current_students - 1 })
      .eq('id', courseId)
  }

  revalidatePath(`/courses/${courseId}`)
  revalidatePath('/courses')

  return { success: true, message: '수강 신청이 취소되었습니다.' }
}
