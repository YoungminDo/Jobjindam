import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'

export default async function AdminPendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('admin_role, name, email')
    .eq('id', user.id)
    .single()

  // 이미 승인됐으면 대시보드로
  if (profile?.admin_role === 'approved' || profile?.admin_role === 'super') {
    redirect('/admin')
  }

  const isRejected = profile?.admin_role === 'rejected'

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isRejected ? 'bg-red-500/10' : 'bg-amber-500/10'
        }`}>
          <Clock className={`w-10 h-10 ${isRejected ? 'text-red-400' : 'text-amber-400'}`} />
        </div>

        {isRejected ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">가입이 거절되었습니다</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              관리자 가입 신청이 거절되었습니다.<br />
              문의 사항이 있다면 슈퍼관리자에게 연락해주세요.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">승인 대기 중</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              <span className="text-white font-medium">{profile?.name || profile?.email}</span>님의<br />
              관리자 가입 신청이 접수되었습니다.
            </p>
            <p className="text-gray-500 text-xs mb-8">
              슈퍼관리자의 승인 후 관리자 패널을 사용할 수 있습니다.
            </p>
          </>
        )}

        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="block w-full py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition text-sm"
          >
            다시 로그인
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            사이트로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
