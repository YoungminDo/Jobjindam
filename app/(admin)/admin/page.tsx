import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Newspaper, Briefcase, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('admin_role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.admin_role !== 'approved' && profile.admin_role !== 'super')) {
    if (profile?.admin_role === 'pending') redirect('/admin/pending')
    redirect('/admin/login')
  }

  const [coursesRes, contentsRes, jobsRes, usersRes, pendingRes] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('contents').select('id', { count: 'exact', head: true }),
    supabase.from('job_postings').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('admin_role', 'pending'),
  ])

  const pendingCount = pendingRes.count ?? 0
  const isSuper = profile.admin_role === 'super'

  const stats = [
    { name: '강의', count: coursesRes.count ?? 0, href: '/admin/courses', icon: GraduationCap, color: 'bg-blue-500' },
    { name: '콘텐츠', count: contentsRes.count ?? 0, href: '/admin/contents', icon: Newspaper, color: 'bg-emerald-500' },
    { name: '채용공고', count: jobsRes.count ?? 0, href: '/admin/jobs', icon: Briefcase, color: 'bg-amber-500' },
    { name: '회원', count: usersRes.count ?? 0, href: '#', icon: Users, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

      {/* 승인 대기 알림 (슈퍼관리자만) */}
      {isSuper && pendingCount > 0 && (
        <Link
          href="/admin/members"
          className="block mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{pendingCount}</span>
            </div>
            <div>
              <p className="font-semibold text-amber-800">관리자 가입 승인 대기</p>
              <p className="text-sm text-amber-600">{pendingCount}명이 승인을 기다리고 있습니다</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="space-y-3">
            <Link
              href="/admin/courses/new"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">새 강의 등록</span>
            </Link>
            <Link
              href="/admin/contents/new"
              className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
            >
              <Newspaper className="w-5 h-5" />
              <span className="font-medium">새 콘텐츠 등록</span>
            </Link>
            <Link
              href="/admin/jobs/new"
              className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">새 채용공고 등록</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">홈 노출 관리</h2>
          <p className="text-gray-500 text-sm mb-4">인기강의, 추천콘텐츠, 마감임박채용의 홈 노출 순서를 설정하세요.</p>
          <Link
            href="/admin/featured"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition"
          >
            노출 순서 관리하기
          </Link>
        </div>
      </div>
    </div>
  )
}
