'use client'

import { useState, useTransition } from 'react'
import { upsertFeaturedItem, deleteFeaturedItem } from '@/app/actions/admin'
import { FEATURED_SECTIONS } from '@/lib/constants'
import { Plus, Trash2, GripVertical, Star, GraduationCap, Newspaper, Briefcase } from 'lucide-react'

interface FeaturedManagerProps {
  featuredItems: any[]
  courses: { id: string; title: string; category: string; status: string }[]
  contents: { id: string; title: string; category: string }[]
  jobs: { id: string; title: string; company_name: string; deadline: string }[]
}

export default function FeaturedManager({ featuredItems, courses, contents, jobs }: FeaturedManagerProps) {
  return (
    <div className="space-y-8">
      {FEATURED_SECTIONS.map((section) => (
        <FeaturedSection
          key={section.id}
          section={section}
          items={featuredItems.filter((item) => item.section === section.id)}
          courses={courses}
          contents={contents}
          jobs={jobs}
        />
      ))}
    </div>
  )
}

function FeaturedSection({
  section,
  items,
  courses,
  contents,
  jobs,
}: {
  section: typeof FEATURED_SECTIONS[number]
  items: any[]
  courses: FeaturedManagerProps['courses']
  contents: FeaturedManagerProps['contents']
  jobs: FeaturedManagerProps['jobs']
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState('')
  const [order, setOrder] = useState(items.length + 1)

  const sectionType = section.id === 'popular_courses' ? 'course' :
                      section.id === 'recommended_contents' ? 'content' : 'job'

  const getIcon = () => {
    switch (sectionType) {
      case 'course': return <GraduationCap className="w-5 h-5 text-blue-600" />
      case 'content': return <Newspaper className="w-5 h-5 text-emerald-600" />
      case 'job': return <Briefcase className="w-5 h-5 text-amber-600" />
    }
  }

  const getItemName = (item: any) => {
    if (item.course_id) {
      const c = courses.find((c) => c.id === item.course_id)
      return c ? c.title : '(삭제된 강의)'
    }
    if (item.content_id) {
      const c = contents.find((c) => c.id === item.content_id)
      return c ? c.title : '(삭제된 콘텐츠)'
    }
    if (item.job_id) {
      const j = jobs.find((j) => j.id === item.job_id)
      return j ? `${j.company_name} - ${j.title}` : '(삭제된 공고)'
    }
    return '알 수 없음'
  }

  const getOptions = () => {
    switch (sectionType) {
      case 'course': return courses.map((c) => ({ id: c.id, label: c.title }))
      case 'content': return contents.map((c) => ({ id: c.id, label: c.title }))
      case 'job': return jobs.map((j) => ({ id: j.id, label: `${j.company_name} - ${j.title}` }))
    }
  }

  const handleAdd = () => {
    if (!selectedId) return
    const formData = new FormData()
    formData.set('section', section.id)
    if (sectionType === 'course') formData.set('course_id', selectedId)
    if (sectionType === 'content') formData.set('content_id', selectedId)
    if (sectionType === 'job') formData.set('job_id', selectedId)
    formData.set('display_order', String(order))
    formData.set('is_active', 'true')

    startTransition(async () => {
      await upsertFeaturedItem(formData)
      setShowAdd(false)
      setSelectedId('')
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('이 노출 항목을 삭제하시겠습니까?')) return
    startTransition(() => deleteFeaturedItem(id))
  }

  const handleOrderChange = (item: any, newOrder: number) => {
    const formData = new FormData()
    formData.set('id', item.id)
    formData.set('section', item.section)
    if (item.course_id) formData.set('course_id', item.course_id)
    if (item.content_id) formData.set('content_id', item.content_id)
    if (item.job_id) formData.set('job_id', item.job_id)
    formData.set('display_order', String(newOrder))
    formData.set('is_active', String(item.is_active))

    startTransition(() => upsertFeaturedItem(formData))
  }

  const sortedItems = [...items].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h2 className="text-base font-semibold text-gray-900">{section.name}</h2>
            <p className="text-xs text-gray-500">{section.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {/* 기존 항목 목록 */}
      <div className="divide-y divide-gray-100">
        {sortedItems.length === 0 && !showAdd && (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            등록된 항목이 없습니다. &apos;추가&apos; 버튼을 눌러 홈에 노출할 항목을 설정하세요.
          </div>
        )}

        {sortedItems.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center gap-4">
            <GripVertical className="w-4 h-4 text-gray-300" />

            {/* 순위 뱃지 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              item.display_order === 1 ? 'bg-yellow-100 text-yellow-700' :
              item.display_order === 2 ? 'bg-gray-100 text-gray-600' :
              item.display_order === 3 ? 'bg-amber-100 text-amber-700' :
              'bg-gray-50 text-gray-400'
            }`}>
              {item.display_order}
            </div>

            {/* 항목 이름 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{getItemName(item)}</p>
            </div>

            {/* 순위 변경 */}
            <select
              value={item.display_order}
              onChange={(e) => handleOrderChange(item, parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}순위</option>
              ))}
            </select>

            {/* 활성 상태 */}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {item.is_active ? '노출중' : '비활성'}
            </span>

            {/* 삭제 */}
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition"
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 추가 폼 */}
      {showAdd && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {sectionType === 'course' ? '강의 선택' : sectionType === 'content' ? '콘텐츠 선택' : '채용공고 선택'}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">선택하세요</option>
                {getOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-600 mb-1">순위</label>
              <select
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}순위</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedId || isPending}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition disabled:opacity-50"
            >
              {isPending ? '추가 중...' : '추가'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
