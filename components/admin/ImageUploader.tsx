'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  currentUrl?: string | null
  name: string  // hidden input name
  bucket?: string
  folder?: string
  label?: string
  onImageChange?: (url: string) => void
}

export default function ImageUploader({
  currentUrl,
  name,
  bucket = 'thumbnails',
  folder = 'images',
  label = '썸네일 이미지',
  onImageChange,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('업로드 실패: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setImageUrl(publicUrl)
      onImageChange?.(publicUrl)
    } catch (err) {
      console.error(err)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleRemove = () => {
    setImageUrl('')
    onImageChange?.('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={imageUrl} />
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {imageUrl ? (
        // 이미지 미리보기
        <div className="relative group">
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={imageUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition"
          >
            이미지 변경
          </button>
        </div>
      ) : (
        // 업로드 영역
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            w-full aspect-video rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center cursor-pointer transition
            ${dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5'
            }
            ${uploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500">업로드 중...</p>
            </>
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">클릭하거나 이미지를 드래그하세요</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (최대 5MB)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
