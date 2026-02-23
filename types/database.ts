// 취준진담 데이터베이스 타입 정의

export interface Profile {
  id: string
  email: string
  name: string | null
  profile_image_url: string | null
  target_job: string | null
  preparation_stage: string | null
  interests: string[]
  is_admin: boolean
  admin_role: 'pending' | 'approved' | 'rejected' | 'super' | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  icon_emoji: string
  color: string
  type: 'course' | 'content' | 'job'
  order: number
}

export interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  instructor_title: string | null
  category: string
  thumbnail_url: string | null
  max_students: number
  current_students: number
  start_date: string
  end_date: string
  duration_weeks: number
  price: number
  is_live: boolean
  syllabus: SyllabusItem[]
  rating: number
  review_count: number
  status: 'recruiting' | 'closed' | 'ongoing' | 'finished'
  created_at: string
  updated_at: string
}

export interface SyllabusItem {
  week: number
  title: string
  description: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'applied' | 'approved' | 'completed' | 'canceled'
  payment_status: string | null
  enrolled_at: string
  completed_at: string | null
}

export interface Content {
  id: string
  title: string
  summary: string
  body: string
  author_id: string
  author_name: string
  author_title: string | null
  thumbnail_url: string | null
  category: string
  tags: string[]
  view_count: number
  like_count: number
  bookmark_count: number
  is_featured: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  user_id: string
  content_id: string
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  content_id: string | null
  course_id: string | null
  content_type: 'content' | 'course'
  created_at: string
}

export interface JobPosting {
  id: string
  company_name: string
  title: string
  description: string | null
  job_type: 'newgrad' | 'intern' | 'experienced'
  location: string | null
  deadline: string
  url: string | null
  thumbnail_url: string | null
  tags: string[]
  source: string | null
  is_active: boolean
  created_at: string
}

export interface ChatRoom {
  id: string
  type: 'dm' | 'group'
  name: string | null
  created_by: string
  created_at: string
}

export interface ChatParticipant {
  id: string
  room_id: string
  user_id: string
  joined_at: string
}

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image'
  file_url: string | null
  created_at: string
  sender?: Profile
}

export interface Mentor {
  id: string
  user_id: string
  company: string
  position: string
  years_of_experience: number
  expertise: string[]
  introduction: string | null
  is_verified: boolean
  availability: string | null
  created_at: string
  profile?: Profile
}

export interface Tag {
  id: string
  name: string
  emoji: string
  color: string
  order: number
  created_at: string
}

export interface ContentTag {
  id: string
  content_id: string | null
  course_id: string | null
  job_id: string | null
  tag_id: string
  created_at: string
  tag?: Tag
}

export interface FeaturedItem {
  id: string
  section: 'popular_courses' | 'recommended_contents' | 'urgent_jobs'
  course_id: string | null
  content_id: string | null
  job_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  course?: Course
  content?: Content
  job_posting?: JobPosting
}

export interface HeroBanner {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  link_type: 'course' | 'content' | 'job' | 'custom'
  course_id: string | null
  content_id: string | null
  job_id: string | null
  custom_url: string | null
  bg_color: string
  text_color: string
  focal_x: number
  focal_y: number
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // joined
  course?: Course
  content?: Content
  job_posting?: JobPosting
}

export interface ChatRoomWithDetails extends ChatRoom {
  participants: (ChatParticipant & { profile: Profile })[]
  last_message?: Message
}
