'use client'

import { useState, lazy, Suspense } from 'react'
import { COURSE_CATEGORIES } from '@/lib/constants'
import TagSelector from './TagSelector'
import ImageUploader from './ImageUploader'
import type { Course, Tag } from '@/types/database'

const RichEditor = lazy(() => import('./RichEditor'))

interface CourseFormProps {
  course?: Course
  allTags: Tag[]
  initialTagIds: string[]
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function CourseForm({ course, allTags, initialTagIds, action, submitLabel }: CourseFormProps) {
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds)
  const [isLive, setIsLive] = useState(course?.is_live ?? false)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tag_ids" value={tagIds.join(',')} />
      <input type="hidden" name="is_live" value={String(isLive)} />

      {/* 썸네일 이미지 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ImageUploader
          currentUrl={course?.thumbnail_url}
          name="thumbnail_url"
          folder="courses"
          label="강의 썸네일 이미지"
        />
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">강의명 *</label>
            <input
              name="title"
              defaultValue={course?.title}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="강의 제목을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
            <select
              name="category"
              defaultValue={course?.category}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              {COURSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              name="status"
              defaultValue={course?.status || 'recruiting'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="recruiting">모집중</option>
              <option value="closed">마감</option>
              <option value="ongoing">진행중</option>
              <option value="finished">종료</option>
            </select>
          </div>
        </div>
      </div>

      {/* 강의 설명 (리치 에디터) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">강의 설명</h2>
        <Suspense fallback={<div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />}>
          <RichEditor
            content={course?.description || ''}
            name="description"
            placeholder="강의에 대한 상세 설명을 작성하세요. 이미지도 삽입할 수 있습니다."
            minHeight="200px"
          />
        </Suspense>
      </div>

      {/* 강사 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">강사 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강사명 *</label>
            <input
              name="instructor_name"
              defaultValue={course?.instructor_name}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강사 직함</label>
            <input
              name="instructor_title"
              defaultValue={course?.instructor_title || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* 수강 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">수강 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최대 수강생</label>
            <input
              name="max_students"
              type="number"
              defaultValue={course?.max_students || 30}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          {course && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 수강생</label>
              <input
                name="current_students"
                type="number"
                defaultValue={course.current_students || 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
            <input
              name="price"
              type="number"
              defaultValue={course?.price || 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기간 (주)</label>
            <input
              name="duration_weeks"
              type="number"
              defaultValue={course?.duration_weeks || 4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
            <input
              name="start_date"
              type="date"
              defaultValue={course?.start_date}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일 *</label>
            <input
              name="end_date"
              type="date"
              defaultValue={course?.end_date}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">🔴 라이브 강의</span>
          </label>
        </div>
        {course && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">평점</label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                defaultValue={course.rating || 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 수</label>
              <input
                name="review_count"
                type="number"
                defaultValue={course.review_count || 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 커리큘럼 (리치 에디터) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">커리큘럼</h2>
        <Suspense fallback={<div className="h-[250px] bg-gray-50 rounded-lg animate-pulse" />}>
          <RichEditor
            content={course?.syllabus ? (typeof course.syllabus === 'string' ? course.syllabus : '') : ''}
            name="syllabus"
            placeholder="주차별 커리큘럼을 작성하세요. 예: 1주차 - OT 및 소개..."
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

      {/* 제출 */}
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
