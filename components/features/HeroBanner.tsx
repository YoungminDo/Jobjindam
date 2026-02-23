'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroBanner } from '@/types/database'

interface HeroBannerProps {
  banners: HeroBanner[]
}

export default function HeroBannerCarousel({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = banners.length

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  // 자동 롤링 (4초 간격)
  useEffect(() => {
    if (total <= 1 || isPaused) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [total, isPaused, next])

  if (total === 0) return null

  const banner = banners[current]

  // 배너 링크 URL 생성
  function getBannerHref(b: HeroBanner): string {
    switch (b.link_type) {
      case 'course':
        return b.course_id ? `/courses/${b.course_id}` : '/courses'
      case 'content':
        return b.content_id ? `/contents/${b.content_id}` : '/contents'
      case 'job':
        return b.job_id ? `/jobs` : '/jobs'
      case 'custom':
        return b.custom_url || '/'
      default:
        return '/'
    }
  }

  const href = getBannerHref(banner)
  const isExternal = banner.link_type === 'custom' && banner.custom_url?.startsWith('http')

  const bannerContent = (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 배너 이미지 (필수) */}
      <div className="relative h-[300px] md:h-[450px]">
        <img
          src={banner.image_url || ''}
          alt={banner.title}
          className="w-full h-full object-cover"
          style={{ objectPosition: `${banner.focal_x ?? 50}% ${banner.focal_y ?? 50}%` }}
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* 텍스트 오버레이 */}
        <div className="absolute inset-0 flex items-end pb-12 md:pb-16 justify-center">
          <div className="text-center px-6 max-w-screen-md">
            <h2
              className="text-2xl md:text-5xl font-bold drop-shadow-lg leading-tight"
              style={{ color: banner.text_color || '#ffffff' }}
            >
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p
                className="text-sm md:text-xl mt-3 opacity-90 drop-shadow"
                style={{ color: banner.text_color || '#ffffff' }}
              >
                {banner.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 좌우 화살표 (2개 이상일 때) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition z-10 backdrop-blur-sm"
            aria-label="이전 배너"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition z-10 backdrop-blur-sm"
            aria-label="다음 배너"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* 인디케이터 (2개 이상일 때) */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(idx) }}
              className={`rounded-full transition-all ${
                idx === current
                  ? 'w-7 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`배너 ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  // 링크로 감싸기
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {bannerContent}
      </a>
    )
  }

  return (
    <Link href={href} className="block">
      {bannerContent}
    </Link>
  )
}
