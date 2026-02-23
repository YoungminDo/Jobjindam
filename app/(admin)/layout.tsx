import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, GraduationCap, Newspaper, Briefcase, Star, ArrowLeft, Users, Image } from 'lucide-react'

const ADMIN_NAV = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '히어로 배너', href: '/admin/banners', icon: Image },
  { name: '강의 관리', href: '/admin/courses', icon: GraduationCap },
  { name: '콘텐츠 관리', href: '/admin/contents', icon: Newspaper },
  { name: '채용 관리', href: '/admin/jobs', icon: Briefcase },
  { name: '홈 노출 관리', href: '/admin/featured', icon: Star },
]

const SUPER_NAV = [
  { name: '멤버 관리', href: '/admin/members', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 비로그인 → 사이드바 없이 (login/signup 페이지)
  if (!user) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, admin_role, name, email')
    .eq('id', user.id)
    .single()

  // admin_role이 없거나 pending/rejected → 사이드바 없이 (pending 페이지 등)
  if (!profile || !profile.admin_role || profile.admin_role === 'pending' || profile.admin_role === 'rejected') {
    return <>{children}</>
  }

  const isSuper = profile.admin_role === 'super'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 fixed h-full z-10">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">취준진담 Admin</h1>
          <p className="text-xs text-gray-400 mt-1">
            {isSuper ? '👑 슈퍼관리자' : '관리자'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition text-sm"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}

          {isSuper && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">슈퍼관리자</p>
              </div>
              {SUPER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-300 hover:bg-gray-800 hover:text-purple-200 transition text-sm"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="px-4 py-2">
            <p className="text-xs text-gray-400 truncate">{profile.name || profile.email}</p>
            <p className="text-[10px] text-gray-500 truncate">{profile.email}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
