import { requireAuth } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GraduationCap, Bookmark, Settings, ChevronRight, LogOut } from 'lucide-react'
import LogoutButton from './LogoutButton'

export default async function MyPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: enrollmentCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'canceled')

  const { count: bookmarkCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const menuItems = [
    { name: '내 수강 목록', href: '/my/courses', icon: GraduationCap, count: enrollmentCount },
    { name: '북마크', href: '/my/bookmarks', icon: Bookmark, count: bookmarkCount },
    { name: '설정', href: '/my/settings', icon: Settings },
  ]

  return (
    <div className="max-w-screen-md mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-2xl">
            {profile?.name ? profile.name[0] : '👤'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {profile?.name || '이름 미설정'}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            {profile?.target_job && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full font-medium">
                {profile.target_job}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mt-2 bg-white divide-y divide-gray-100">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== undefined && item.count !== null && (
                <span className="text-xs text-primary font-semibold">{item.count}</span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* 로그아웃 */}
      <div className="mt-2 bg-white">
        <LogoutButton />
      </div>
    </div>
  )
}
