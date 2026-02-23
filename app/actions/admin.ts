'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================
// 어드민 권한 체크 헬퍼
// ============================================
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, admin_role')
    .eq('id', user.id)
    .single()

  // approved 또는 super만 허용
  if (!profile || (profile.admin_role !== 'approved' && profile.admin_role !== 'super')) {
    throw new Error('어드민 권한이 필요합니다')
  }
  return { supabase, user, profile }
}

async function requireSuperAdmin() {
  const { supabase, user, profile } = await requireAdmin()
  if (profile.admin_role !== 'super') {
    throw new Error('슈퍼관리자 권한이 필요합니다')
  }
  return { supabase, user }
}

// ============================================
// 관리자 승인/거절
// ============================================
export async function approveAdmin(userId: string) {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({ admin_role: 'approved', is_admin: true })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/members')
}

export async function rejectAdmin(userId: string) {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({ admin_role: 'rejected', is_admin: false })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/members')
}

// ============================================
// 태그 관리
// ============================================
async function syncTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tagIds: string[],
  itemId: string,
  itemType: 'course' | 'content' | 'job'
) {
  const fieldMap = {
    course: 'course_id',
    content: 'content_id',
    job: 'job_id',
  }
  const field = fieldMap[itemType]

  // 기존 태그 삭제
  await supabase.from('content_tags').delete().eq(field, itemId)

  // 새 태그 연결
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({
      [field]: itemId,
      tag_id: tagId,
    }))
    await supabase.from('content_tags').insert(rows)
  }
}

// ============================================
// 강의 CRUD
// ============================================
export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin()

  const syllabusRaw = formData.get('syllabus') as string || ''
  // 리치 에디터 HTML이면 JSON 문자열로 감싸서 저장, 그렇지 않으면 JSON 파싱
  let syllabus: unknown = syllabusRaw
  if (!syllabusRaw.startsWith('<')) {
    try { syllabus = JSON.parse(syllabusRaw || '[]') } catch { syllabus = syllabusRaw }
  }

  const { data, error } = await supabase.from('courses').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    instructor_name: formData.get('instructor_name') as string,
    instructor_title: formData.get('instructor_title') as string || null,
    category: formData.get('category') as string,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    max_students: parseInt(formData.get('max_students') as string) || 30,
    price: parseInt(formData.get('price') as string) || 0,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    duration_weeks: parseInt(formData.get('duration_weeks') as string) || 4,
    is_live: formData.get('is_live') === 'true',
    status: formData.get('status') as string || 'recruiting',
    syllabus,
  }).select().single()

  if (error) throw new Error(error.message)

  // 태그 연결
  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  if (data && tagIds.length > 0) {
    await syncTags(supabase, tagIds, data.id, 'course')
  }

  revalidatePath('/admin/courses')
  revalidatePath('/')
  redirect('/admin/courses')
}

export async function updateCourse(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const syllabusRaw = formData.get('syllabus') as string || ''
  let syllabus: unknown = syllabusRaw
  if (!syllabusRaw.startsWith('<')) {
    try { syllabus = JSON.parse(syllabusRaw || '[]') } catch { syllabus = syllabusRaw }
  }

  const { error } = await supabase.from('courses').update({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    instructor_name: formData.get('instructor_name') as string,
    instructor_title: formData.get('instructor_title') as string || null,
    category: formData.get('category') as string,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    max_students: parseInt(formData.get('max_students') as string) || 30,
    current_students: parseInt(formData.get('current_students') as string) || 0,
    price: parseInt(formData.get('price') as string) || 0,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    duration_weeks: parseInt(formData.get('duration_weeks') as string) || 4,
    is_live: formData.get('is_live') === 'true',
    status: formData.get('status') as string || 'recruiting',
    rating: parseFloat(formData.get('rating') as string) || 0,
    review_count: parseInt(formData.get('review_count') as string) || 0,
    syllabus,
    updated_at: new Date().toISOString(),
  }).eq('id', courseId)

  if (error) throw new Error(error.message)

  // 태그 동기화
  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  await syncTags(supabase, tagIds, courseId, 'course')

  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/')
  redirect('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  revalidatePath('/')
  redirect('/admin/courses')
}

// ============================================
// 콘텐츠 CRUD
// ============================================
export async function createContent(formData: FormData) {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase.from('contents').insert({
    title: formData.get('title') as string,
    summary: formData.get('summary') as string,
    body: formData.get('body') as string,
    author_name: formData.get('author_name') as string,
    author_title: formData.get('author_title') as string || null,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    category: formData.get('category') as string,
    tags: (formData.get('legacy_tags') as string || '').split(',').filter(Boolean),
    is_featured: formData.get('is_featured') === 'true',
  }).select().single()

  if (error) throw new Error(error.message)

  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  if (data && tagIds.length > 0) {
    await syncTags(supabase, tagIds, data.id, 'content')
  }

  revalidatePath('/admin/contents')
  revalidatePath('/')
  redirect('/admin/contents')
}

export async function updateContent(contentId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('contents').update({
    title: formData.get('title') as string,
    summary: formData.get('summary') as string,
    body: formData.get('body') as string,
    author_name: formData.get('author_name') as string,
    author_title: formData.get('author_title') as string || null,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    category: formData.get('category') as string,
    tags: (formData.get('legacy_tags') as string || '').split(',').filter(Boolean),
    is_featured: formData.get('is_featured') === 'true',
    updated_at: new Date().toISOString(),
  }).eq('id', contentId)

  if (error) throw new Error(error.message)

  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  await syncTags(supabase, tagIds, contentId, 'content')

  revalidatePath('/admin/contents')
  revalidatePath(`/admin/contents/${contentId}`)
  revalidatePath('/')
  redirect('/admin/contents')
}

export async function deleteContent(contentId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('contents').delete().eq('id', contentId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/contents')
  revalidatePath('/')
  redirect('/admin/contents')
}

// ============================================
// 채용공고 CRUD
// ============================================
export async function createJob(formData: FormData) {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase.from('job_postings').insert({
    company_name: formData.get('company_name') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    job_type: formData.get('job_type') as string,
    location: formData.get('location') as string || null,
    deadline: formData.get('deadline') as string,
    url: formData.get('url') as string || null,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    tags: (formData.get('legacy_tags') as string || '').split(',').filter(Boolean),
    source: formData.get('source') as string || null,
    is_active: formData.get('is_active') !== 'false',
  }).select().single()

  if (error) throw new Error(error.message)

  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  if (data && tagIds.length > 0) {
    await syncTags(supabase, tagIds, data.id, 'job')
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/')
  redirect('/admin/jobs')
}

export async function updateJob(jobId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('job_postings').update({
    company_name: formData.get('company_name') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    job_type: formData.get('job_type') as string,
    location: formData.get('location') as string || null,
    deadline: formData.get('deadline') as string,
    url: formData.get('url') as string || null,
    thumbnail_url: formData.get('thumbnail_url') as string || null,
    tags: (formData.get('legacy_tags') as string || '').split(',').filter(Boolean),
    source: formData.get('source') as string || null,
    is_active: formData.get('is_active') !== 'false',
  }).eq('id', jobId)

  if (error) throw new Error(error.message)

  const tagIds = (formData.get('tag_ids') as string || '').split(',').filter(Boolean)
  await syncTags(supabase, tagIds, jobId, 'job')

  revalidatePath('/admin/jobs')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/')
  redirect('/admin/jobs')
}

export async function deleteJob(jobId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('job_postings').delete().eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/jobs')
  revalidatePath('/')
  redirect('/admin/jobs')
}

// ============================================
// 히어로 배너 CRUD
// ============================================
export async function createHeroBanner(formData: FormData) {
  const { supabase } = await requireAdmin()

  const linkType = formData.get('link_type') as string

  const { error } = await supabase.from('hero_banners').insert({
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string || null,
    image_url: formData.get('image_url') as string || null,
    link_type: linkType,
    course_id: linkType === 'course' ? (formData.get('course_id') as string || null) : null,
    content_id: linkType === 'content' ? (formData.get('content_id') as string || null) : null,
    job_id: linkType === 'job' ? (formData.get('job_id') as string || null) : null,
    custom_url: linkType === 'custom' ? (formData.get('custom_url') as string || null) : null,
    bg_color: formData.get('bg_color') as string || '#EBF2FF',
    text_color: formData.get('text_color') as string || '#ffffff',
    focal_x: parseInt(formData.get('focal_x') as string) || 50,
    focal_y: parseInt(formData.get('focal_y') as string) || 50,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_active: formData.get('is_active') !== 'false',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/banners')
  revalidatePath('/')
  redirect('/admin/banners')
}

export async function updateHeroBanner(bannerId: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const linkType = formData.get('link_type') as string

  const { error } = await supabase.from('hero_banners').update({
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string || null,
    image_url: formData.get('image_url') as string || null,
    link_type: linkType,
    course_id: linkType === 'course' ? (formData.get('course_id') as string || null) : null,
    content_id: linkType === 'content' ? (formData.get('content_id') as string || null) : null,
    job_id: linkType === 'job' ? (formData.get('job_id') as string || null) : null,
    custom_url: linkType === 'custom' ? (formData.get('custom_url') as string || null) : null,
    bg_color: formData.get('bg_color') as string || '#EBF2FF',
    text_color: formData.get('text_color') as string || '#ffffff',
    focal_x: parseInt(formData.get('focal_x') as string) || 50,
    focal_y: parseInt(formData.get('focal_y') as string) || 50,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_active: formData.get('is_active') !== 'false',
    updated_at: new Date().toISOString(),
  }).eq('id', bannerId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/banners')
  revalidatePath('/')
  redirect('/admin/banners')
}

export async function deleteHeroBanner(bannerId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('hero_banners').delete().eq('id', bannerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/banners')
  revalidatePath('/')
  redirect('/admin/banners')
}

// ============================================
// 홈 노출 관리
// ============================================
export async function upsertFeaturedItem(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = formData.get('id') as string
  const section = formData.get('section') as string
  const courseId = formData.get('course_id') as string || null
  const contentId = formData.get('content_id') as string || null
  const jobId = formData.get('job_id') as string || null
  const displayOrder = parseInt(formData.get('display_order') as string) || 0
  const isActive = formData.get('is_active') !== 'false'

  if (id) {
    await supabase.from('featured_items').update({
      section,
      course_id: courseId,
      content_id: contentId,
      job_id: jobId,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
  } else {
    await supabase.from('featured_items').insert({
      section,
      course_id: courseId,
      content_id: contentId,
      job_id: jobId,
      display_order: displayOrder,
      is_active: isActive,
    })
  }

  revalidatePath('/admin/featured')
  revalidatePath('/')
}

export async function deleteFeaturedItem(id: string) {
  const { supabase } = await requireAdmin()
  await supabase.from('featured_items').delete().eq('id', id)
  revalidatePath('/admin/featured')
  revalidatePath('/')
}
