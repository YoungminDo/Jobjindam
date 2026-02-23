'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { SUPER_ADMIN_EMAILS } from '@/lib/constants'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 1) 로그인
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    // 2) 프로필 조회
    let { data: profile } = await supabase
      .from('profiles')
      .select('admin_role, is_admin')
      .eq('id', data.user.id)
      .single()

    // 프로필이 없으면 생성 시도 (트리거 실패 대비)
    if (!profile) {
      const isSuperAdmin = SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase())
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || null,
        is_admin: isSuperAdmin,
        admin_role: isSuperAdmin ? 'super' : null,
      })

      // 다시 조회
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('admin_role, is_admin')
        .eq('id', data.user.id)
        .single()

      profile = retryProfile
    }

    if (!profile) {
      setError('프로필 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
      return
    }

    // 3) admin_role이 아예 없는 경우 (일반 사이트에서 가입한 유저)
    if (!profile.admin_role) {
      const isSuperAdmin = SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase())

      if (isSuperAdmin) {
        // 슈퍼관리자 이메일이면 자동으로 super 권한 부여
        await supabase
          .from('profiles')
          .update({ admin_role: 'super', is_admin: true })
          .eq('id', data.user.id)

        router.push('/admin')
        router.refresh()
        return
      }

      setError('관리자 권한이 없습니다. 먼저 관리자 가입 신청을 해주세요.')
      setLoading(false)
      return
    }

    // 4) 상태별 분기
    if (profile.admin_role === 'pending') {
      router.push('/admin/pending')
      return
    }

    if (profile.admin_role === 'rejected') {
      setError('관리자 가입이 거절되었습니다. 문의해주세요.')
      setLoading(false)
      return
    }

    if (profile.admin_role === 'approved' || profile.admin_role === 'super') {
      router.push('/admin')
      router.refresh()
      return
    }

    setError('알 수 없는 관리자 상태입니다.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">취준진담 Admin</h1>
          <p className="text-gray-400 text-sm mt-1">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '관리자 로그인'}
          </button>

          <div className="text-center pt-2">
            <Link href="/admin/signup" className="text-sm text-gray-400 hover:text-primary transition">
              관리자 가입 신청하기
            </Link>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition">
            ← 사이트로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
