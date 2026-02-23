'use client'

import { useState, lazy, Suspense } from 'react'
import { JOB_TYPES } from '@/lib/constants'
import TagSelector from './TagSelector'
import ImageUploader from './ImageUploader'
import type { JobPosting, Tag } from '@/types/database'

const RichEditor = lazy(() => import('./RichEditor'))

interface JobFormProps {
  job?: JobPosting
  allTags: Tag[]
  initialTagIds: string[]
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function JobForm({ job, allTags, initialTagIds, action, submitLabel }: JobFormProps) {
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds)
  const [isActive, setIsActive] = useState(job?.is_active ?? true)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tag_ids" value={tagIds.join(',')} />
      <input type="hidden" name="is_active" value={String(isActive)} />

      {/* 회사 로고/이미지 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ImageUploader
          currentUrl={job?.thumbnail_url}
          name="thumbnail_url"
          folder="jobs"
          label="회사 로고 / 채용 이미지"
        />
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
            <input
              name="company_name"
              defaultValue={job?.company_name}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="카카오"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">채용 유형 *</label>
            <select
              name="job_type"
              defaultValue={job?.job_type || 'newgrad'}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">채용 제목 *</label>
            <input
              name="title"
              defaultValue={job?.title}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="2025 상반기 신입 공채"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">근무지</label>
            <input
              name="location"
              defaultValue={job?.location || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="판교"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">마감일 *</label>
            <input
              name="deadline"
              type="date"
              defaultValue={job?.deadline}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">지원 링크</label>
            <input
              name="url"
              type="url"
              defaultValue={job?.url || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="https://careers.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">출처</label>
            <input
              name="source"
              defaultValue={job?.source || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="공식 채용페이지"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레거시 태그 (콤마 구분)</label>
            <input
              name="legacy_tags"
              defaultValue={job?.tags?.join(',') || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="IT, 개발, 기획"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">활성 공고 (홈에 노출)</span>
          </label>
        </div>
      </div>

      {/* 채용 상세 설명 (리치 에디터) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">채용 상세 설명</h2>
        <Suspense fallback={<div className="h-[250px] bg-gray-50 rounded-lg animate-pulse" />}>
          <RichEditor
            content={job?.description || ''}
            name="description"
            placeholder="채용 상세 내용을 작성하세요. 자격 요건, 우대 사항, 복리후생 등을 자유롭게 작성할 수 있습니다."
            minHeight="250px"
          />
        </Suspense>
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
