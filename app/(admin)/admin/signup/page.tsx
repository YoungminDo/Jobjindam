'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { SUPER_ADMIN_EMAILS } from '@/lib/constants'

export default function AdminSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 비밀번호 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // 1) Supabase Auth에 회원가입
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (authError) {
      if (authError.message === 'User already registered') {
        setError('이미 가입된 이메일입니다. 로그인해주세요.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('회원가입에 실패했습니다.')
      setLoading(false)
      return
    }

    // 2) 프로필 생성 대기 (트리거가 비동기로 실행될 수 있음)
    const isSuperAdmin = SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase())
    const adminRole = isSuperAdmin ? 'super' : 'pending'

    // 트리거가 프로필을 만들 때까지 최대 3초 대기
    let profileExists = false
    for (let i = 0; i < 6; i++) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (existingProfile) {
        profileExists = true
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (profileExists) {
      // 프로필이 있으면 admin_role 업데이트
      await supabase
        .from('profiles')
        .update({
          is_admin: isSuperAdmin,
          admin_role: adminRole,
          name: name || null,
        })
        .eq('id', data.user.id)
    } else {
      // 프로필이 없으면 직접 생성 (트리거 실패 시 대비)
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          name: name || null,
          is_admin: isSuperAdmin,
          admin_role: adminRole,
        })
    }

    if (isSuperAdmin) {
      router.push('/admin')
      router.refresh()
    } else {
      router.push('/admin/pending')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">관리자 가입 신청</h1>
          <p className="text-gray-400 text-sm mt-1">가입 후 슈퍼관리자의 승인이 필요합니다</p>
        </div>

        <form onSubmit={handleSignup} className="bg-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="이름을 입력하세요"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="6자 이상"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                passwordConfirm && password !== passwordConfirm
                  ? 'border-red-500'
                  : passwordConfirm && password === passwordConfirm
                  ? 'border-green-500'
                  : 'border-gray-600'
              }`}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-red-400 text-xs mt-1">비밀번호가 일치하지 않습니다</p>
            )}
            {passwordConfirm && password === passwordConfirm && (
              <p className="text-green-400 text-xs mt-1">비밀번호가 일치합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">가입 사유 (선택)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="관리자 가입을 원하는 이유를 간단히 적어주세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (passwordConfirm.length > 0 && password !== passwordConfirm)}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? '처리 중...' : '관리자 가입 신청'}
          </button>

          <div className="text-center pt-2">
            <Link href="/admin/login" className="text-sm text-gray-400 hover:text-primary transition">
              이미 계정이 있으신가요? 로그인
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
