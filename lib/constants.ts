// 취준진담 상수 정의

export const SUPER_ADMIN_EMAIL = 'branden@da-sh.io'

export const APP_NAME = '취준진담'
export const APP_DESCRIPTION = '취업 준비생을 위한 강의, 콘텐츠, 정보, 네트워킹을 한 곳에서'
export const APP_TAGLINE = '취업, 혼자가 아닌 함께'

export const COURSE_CATEGORIES = [
  { id: 'resume', name: '이력서/자소서', emoji: '📝', color: '#4A90E2' },
  { id: 'interview', name: '면접 준비', emoji: '💼', color: '#50E3C2' },
  { id: 'coding', name: '코딩테스트', emoji: '💻', color: '#F5A623' },
  { id: 'portfolio', name: '포트폴리오', emoji: '🎨', color: '#E74C3C' },
  { id: 'skill', name: '직무별 스킬', emoji: '📊', color: '#9B59B6' },
  { id: 'attitude', name: '인성/태도', emoji: '🌟', color: '#2ECC71' },
] as const

export const CONTENT_CATEGORIES = [
  { id: 'success_story', name: '합격 후기', emoji: '🎉' },
  { id: 'interview_questions', name: '면접 질문', emoji: '❓' },
  { id: 'resume_review', name: '이력서 첨삭', emoji: '✏️' },
  { id: 'industry_analysis', name: '산업 분석', emoji: '📈' },
  { id: 'trend_report', name: '트렌드 리포트', emoji: '🔥' },
] as const

export const JOB_TYPES = [
  { id: 'newgrad', name: '신입 공채' },
  { id: 'intern', name: '인턴십' },
  { id: 'experienced', name: '수시 채용' },
] as const

export const PREPARATION_STAGES = [
  { id: 'exploring', name: '탐색 중' },
  { id: 'documents', name: '서류 준비' },
  { id: 'interview', name: '면접 준비' },
  { id: 'intern', name: '인턴 진행' },
  { id: 'offer', name: '합격/입사 대기' },
] as const

export const COURSE_STATUS: Record<string, string> = {
  recruiting: '모집중',
  closed: '마감',
  ongoing: '진행중',
  finished: '종료',
}

export const ENROLLMENT_STATUS: Record<string, string> = {
  applied: '신청',
  approved: '승인',
  completed: '완료',
  canceled: '취소',
}

export const HOME_CATEGORIES = [
  { name: '이력서', emoji: '📝', href: '/courses?category=resume' },
  { name: '면접', emoji: '💼', href: '/courses?category=interview' },
  { name: '코테', emoji: '💻', href: '/courses?category=coding' },
  { name: '직무', emoji: '📊', href: '/courses?category=skill' },
  { name: '네트워킹', emoji: '👥', href: '/chat' },
  { name: '채용공고', emoji: '📰', href: '/jobs' },
  { name: '멘토', emoji: '🎓', href: '/chat' },
  { name: '더보기', emoji: '➕', href: '/courses' },
] as const

// 태그 목록 (어드민에서 선택 가능)
export const TAGS = [
  { id: 'resume', name: '이력서', emoji: '📝', color: '#4A90E2' },
  { id: 'interview', name: '면접', emoji: '💼', color: '#50E3C2' },
  { id: 'brand_marketing', name: '브랜드&마케팅', emoji: '📣', color: '#E74C3C' },
  { id: 'sales', name: '영업', emoji: '🤝', color: '#F5A623' },
  { id: 'design', name: '디자인', emoji: '🎨', color: '#9B59B6' },
  { id: 'uiux', name: 'UIUX', emoji: '📱', color: '#1ABC9C' },
  { id: 'biz_dev', name: '사업개발', emoji: '🚀', color: '#2ECC71' },
  { id: 'development', name: '개발', emoji: '💻', color: '#3498DB' },
  { id: 'coaching', name: '코칭', emoji: '🎯', color: '#E67E22' },
  { id: 'career_dev', name: '직무개발', emoji: '📊', color: '#8E44AD' },
  { id: 'data', name: '데이터', emoji: '📈', color: '#16A085' },
  { id: 'finance', name: '금융', emoji: '💰', color: '#F39C12' },
  { id: 'pm', name: 'PM/기획', emoji: '📋', color: '#2980B9' },
  { id: 'startup', name: '스타트업', emoji: '🦄', color: '#E91E63' },
  { id: 'ai', name: 'AI/자동화', emoji: '🤖', color: '#607D8B' },
] as const

// 홈 섹션 타입
export const FEATURED_SECTIONS = [
  { id: 'popular_courses', name: '🔥 인기강의', description: '인기 강의 노출 순서' },
  { id: 'recommended_contents', name: '📰 추천콘텐츠', description: '추천 콘텐츠 노출 순서' },
  { id: 'urgent_jobs', name: '📋 마감임박채용', description: '마감 임박 채용 노출 순서' },
] as const

export const BOTTOM_NAV_ITEMS = [
  { name: '홈', href: '/', icon: 'Home' as const },
  { name: '강의', href: '/courses', icon: 'GraduationCap' as const },
  { name: '콘텐츠', href: '/contents', icon: 'Newspaper' as const },
  { name: '채팅', href: '/chat', icon: 'MessageCircle' as const },
  { name: 'MY', href: '/my', icon: 'User' as const },
] as const
