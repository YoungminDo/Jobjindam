import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Newspaper } from 'lucide-react'
import { CONTENT_CATEGORIES } from '@/lib/constants'

export default async function AdminContentsPage() {
  const supabase = await createClient()

  const { data: contents } = await supabase
    .from('contents')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {contents?.length ?? 0}개의 콘텐츠</p>
        </div>
        <Link
          href="/admin/contents/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          새 콘텐츠 등록
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">제목</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">작성자</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">조회</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">좋아요</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">추천</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contents?.map((content) => {
              const cat = CONTENT_CATEGORIES.find((c) => c.id === content.category)
              return (
                <tr key={content.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Newspaper className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{content.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat?.emoji} {cat?.name || content.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{content.author_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{content.view_count?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{content.like_count?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {content.is_featured && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">추천</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/contents/${content.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      편집
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!contents || contents.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  등록된 콘텐츠가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
