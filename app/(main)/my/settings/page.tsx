'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PREPARATION_STAGES } from '@/lib/constants'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [stage, setStage] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setName(data.name || '')
        setTargetJob(data.target_job || '')
        setStage(data.preparation_stage || '')
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        name,
        target_job: targetJob || null,
        preparation_stage: stage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-screen-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Link href="/my" className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-900">프로필 설정</h1>
      </div>

      <form onSubmit={handleSave} className="p-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">희망 직무</label>
          <input
            type="text"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="예: 프론트엔드 개발자, 마케터"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">준비 단계</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">선택하세요</option>
            {PREPARATION_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition disabled:opacity-50"
        >
          {loading ? '저장 중...' : saved ? '저장 완료!' : '저장하기'}
        </button>
      </form>
    </div>
  )
}
