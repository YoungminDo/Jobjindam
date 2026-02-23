'use client'

import { useState, lazy, Suspense } from 'react'
import { CONTENT_CATEGORIES } from '@/lib/constants'
import TagSelector from './TagSelector'
import ImageUploader from './ImageUploader'
import type { Content, Tag } from '@/types/database'

const RichEditor = lazy(() => import('./RichEditor'))

interface ContentFormProps {
  content?: Content
  allTags: Tag[]
  initialTagIds: string[]
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function ContentForm({ content, allTags, initialTagIds, action, submitLabel }: ContentFormProps) {
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds)
  const [isFeatured, setIsFeatured] = useState(content?.is_featured ?? false)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tag_ids" value={tagIds.join(',')} />
      <input type="hidden" name="is_featured" value={String(isFeatured)} />

      {/* 썸네일 이미지 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ImageUploader
          currentUrl={content?.thumbnail_url}
          name="thumbnail_url"
          folder="contents"
          label="콘텐츠 썸네일 이미지"
        />
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              name="title"
              defaultValue={content?.title}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="콘텐츠 제목을 입력하세요"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">요약 *</label>
            <input
              name="summary"
              defaultValue={content?.summary}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="콘텐츠 요약 (목록에 표시)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
            <select
              name="category"
              defaultValue={content?.category}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              {CONTENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레거시 태그 (콤마 구분)</label>
            <input
              name="legacy_tags"
              defaultValue={content?.tags?.join(',') || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="기획, 대기업, IT"
            />
          </div>
        </div>
      </div>

      {/* 작성자 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">작성자 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">작성자명 *</label>
            <input
              name="author_name"
              defaultValue={content?.author_name}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">작성자 직함</label>
            <input
              name="author_title"
              defaultValue={content?.author_title || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* 본문 (리치 에디터) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">본문</h2>
        <Suspense fallback={<div className="h-[400px] bg-gray-50 rounded-lg animate-pulse" />}>
          <RichEditor
            content={content?.body || ''}
            name="body"
            placeholder="콘텐츠 본문을 작성하세요. 이미지, 링크, 서식을 자유롭게 사용할 수 있습니다."
            minHeight="400px"
          />
        </Suspense>
        <div className="mt-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">⭐ 추천 콘텐츠 설정</span>
          </label>
        </div>
      </div>

      {/* 태그 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <TagSelector
          selectedTagIds={tagIds}
          allTags={allTags}
          onChange={setTagIds}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition shadow-lg shadow-primary/20"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
