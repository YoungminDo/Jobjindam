'use client'

import { useState, useRef, useCallback } from 'react'
import ImageUploader from './ImageUploader'
import { Move, RotateCcw } from 'lucide-react'
import type { HeroBanner, Course, Content, JobPosting } from '@/types/database'

interface BannerFormProps {
  banner?: HeroBanner
  courses: Course[]
  contents: Content[]
  jobs: JobPosting[]
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function BannerForm({
  banner,
  courses,
  contents,
  jobs,
  action,
  submitLabel,
}: BannerFormProps) {
  const [linkType, setLinkType] = useState<string>(banner?.link_type || 'course')
  const [isActive, setIsActive] = useState(banner?.is_active ?? true)
  const [bgColor, setBgColor] = useState(banner?.bg_color || '#EBF2FF')
  const [textColor, setTextColor] = useState(banner?.text_color || '#ffffff')
  const [focalX, setFocalX] = useState(banner?.focal_x ?? 50)
  const [focalY, setFocalY] = useState(banner?.focal_y ?? 50)
  const [imageUrl, setImageUrl] = useState(banner?.image_url || '')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, focalX: 50, focalY: 50 })
  const previewRef = useRef<HTMLDivElement>(null)

  const handleImageChange = useCallback((url: string) => {
    setImageUrl(url)
    if (url && !banner?.image_url) {
      // 새 이미지: 중앙으로 초기화
      setFocalX(50)
      setFocalY(50)
    }
  }, [banner?.image_url])

  // 배너 미리보기에서 드래그로 위치 조정
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, focalX, focalY })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    // 드래그 이동 거리를 0~100% 범위로 변환
    // 이미지를 왼쪽으로 드래그하면 focal point가 오른쪽으로 이동 (반대 방향)
    const dx = ((e.clientX - dragStart.x) / rect.width) * -100
    const dy = ((e.clientY - dragStart.y) / rect.height) * -100
    const newX = Math.round(Math.max(0, Math.min(100, dragStart.focalX + dx)))
    const newY = Math.round(Math.max(0, Math.min(100, dragStart.focalY + dy)))
    setFocalX(newX)
    setFocalY(newY)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const resetFocal = () => {
    setFocalX(50)
    setFocalY(50)
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="is_active" value={String(isActive)} />
      <input type="hidden" name="bg_color" value={bgColor} />
      <input type="hidden" name="text_color" value={textColor} />
      <input type="hidden" name="focal_x" value={String(focalX)} />
      <input type="hidden" name="focal_y" value={String(focalY)} />

      {/* 배너 이미지 (필수) + 위치 조정 통합 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ImageUploader
          currentUrl={banner?.image_url}
          name="image_url"
          folder="banners"
          label="배너 이미지 * (권장: 1200x450px 이상, 가로형)"
          onImageChange={handleImageChange}
        />
        <p className="text-xs text-red-500 mt-2">* 배너 이미지는 필수입니다. 이미지 위에 제목/부제목이 오버레이됩니다.</p>

        {/* 이미지가 있으면 바로 아래에 배너 미리보기 + 드래그 위치 조정 */}
        {imageUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Move className="w-3.5 h-3.5" />
                아래 미리보기를 드래그하여 이미지 노출 위치를 조정하세요
              </p>
              <button
                type="button"
                onClick={resetFocal}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                중앙 리셋
              </button>
            </div>

            {/* 배너 미리보기 (실제 비율) — 드래그 가능 */}
            <div
              ref={previewRef}
              className={`relative w-full h-[180px] md:h-[240px] rounded-lg overflow-hidden border-2 select-none ${
                isDragging ? 'border-primary cursor-grabbing' : 'border-gray-200 cursor-grab'
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <img
                src={imageUrl}
                alt="배너 미리보기"
                className="w-full h-full object-cover pointer-events-none"
                style={{ objectPosition: `${focalX}% ${focalY}%` }}
                draggable={false}
              />
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
              {/* 텍스트 미리보기 */}
              <div className="absolute inset-0 flex items-end pb-6 justify-center pointer-events-none">
                <div className="text-center px-4">
                  <p className="text-lg md:text-2xl font-bold drop-shadow-lg" style={{ color: textColor }}>
                    {banner?.title || '배너 제목'}
                  </p>
                  <p className="text-xs md:text-sm mt-1 opacity-90 drop-shadow" style={{ color: textColor }}>
                    {banner?.subtitle || '부제목이 여기에 표시됩니다'}
                  </p>
                </div>
              </div>
              {/* 십자선 가이드 (드래그 중일 때) */}
              {isDragging && (
                <>
                  <div className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none" style={{ left: '50%' }} />
                  <div className="absolute left-0 right-0 h-px bg-white/50 pointer-events-none" style={{ top: '50%' }} />
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              위치: X {focalX}% / Y {focalY}%
            </p>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">배너 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">배너 제목 *</label>
            <input
              name="title"
              defaultValue={banner?.title}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="취업, 혼자가 아닌 함께"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
            <input
              name="subtitle"
              defaultValue={banner?.subtitle || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="검증된 강의와 콘텐츠, 실시간 네트워킹까지"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">노출 순서</label>
            <input
              name="display_order"
              type="number"
              defaultValue={banner?.display_order || 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">숫자가 작을수록 먼저 노출됩니다</p>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">활성 배너 (홈에 노출)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 텍스트 색상 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">텍스트 색상</h2>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-40 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
          <span className="text-xs text-gray-400">이미지 위에 표시되는 제목/부제목 색상</span>
        </div>
      </div>

      {/* 랜딩 연결 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">랜딩 페이지 연결</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">랜딩 유형 *</label>
            <select
              name="link_type"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="course">강의</option>
              <option value="content">콘텐츠</option>
              <option value="job">채용공고</option>
              <option value="custom">직접 입력 (외부 URL)</option>
            </select>
          </div>

          {linkType === 'course' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연결할 강의 *</label>
              <select
                name="course_id"
                defaultValue={banner?.course_id || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              >
                <option value="">강의를 선택하세요</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.instructor_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {linkType === 'content' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연결할 콘텐츠 *</label>
              <select
                name="content_id"
                defaultValue={banner?.content_id || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              >
                <option value="">콘텐츠를 선택하세요</option>
                {contents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.author_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {linkType === 'job' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연결할 채용공고 *</label>
              <select
                name="job_id"
                defaultValue={banner?.job_id || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              >
                <option value="">채용공고를 선택하세요</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    [{j.company_name}] {j.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {linkType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">외부 URL *</label>
              <input
                name="custom_url"
                type="url"
                defaultValue={banner?.custom_url || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="https://example.com"
              />
            </div>
          )}
        </div>
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
