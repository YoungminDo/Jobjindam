import { requireAuth } from '@/lib/auth/session'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-black mb-8">8시간 ⏰</h2>
        <nav className="space-y-2">
          <Link 
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🏠 대시보드
          </Link>
          <Link 
            href="/profile"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            👤 프로필
          </Link>
          <Link 
            href="/settings"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            ⚙️ 설정
          </Link>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-gray-900">
              환영합니다! 👋
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
