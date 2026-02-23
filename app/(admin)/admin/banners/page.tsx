import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Image, Eye, EyeOff } from 'lucide-react'

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const { data: banners } = await supabase
    .from('hero_banners')
    .select('*')
    .order('display_order')

  const linkTypeLabel: Record<string, string> = {
    course: '강의',
    content: '콘텐츠',
    job: '채용공고',
    custom: '외부 링크',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">히어로 배너 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {banners?.length ?? 0}개 배너 (최대 5개, 자동 롤링)
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition"
        >
          <Plus className="w-4 h-4" />
          새 배너 등록
        </Link>
      </div>

      {/* 배너 카드 리스트 */}
      <div className="space-y-4">
        {banners?.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex"
          >
            {/* 배너 미리보기 */}
            <div
              className="w-64 h-36 shrink-0 flex items-center justify-center relative"
              style={{ backgroundColor: banner.bg_color || '#EBF2FF' }}
            >
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-4" style={{ color: banner.text_color || '#1a1a1a' }}>
                  <p className="font-bold text-sm line-clamp-2">{banner.title}</p>
                  {banner.subtitle && (
                    <p className="text-xs mt-1 opacity-70 line-clamp-1">{banner.subtitle}</p>
                  )}
                </div>
              )}
              {/* 순서 배지 */}
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold">
                {banner.display_order}
              </div>
            </div>

            {/* 배너 정보 */}
            <div className="flex-1 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  {banner.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      <Eye className="w-3 h-3" /> 활성
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                      <EyeOff className="w-3 h-3" /> 비활성
                    </span>
                  )}
                </div>
                {banner.subtitle && (
                  <p className="text-sm text-gray-500">{banner.subtitle}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>랜딩: {linkTypeLabel[banner.link_type] || banner.link_type}</span>
                  <span>배경: {banner.bg_color}</span>
                </div>
              </div>
              <Link
                href={`/admin/banners/${banner.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary-light rounded-lg transition"
              >
                <Edit className="w-3.5 h-3.5" />
                편집
              </Link>
            </div>
          </div>
        ))}

        {(!banners || banners.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">등록된 배너가 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">새 배너를 등록하면 홈 상단에 자동 롤링됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
