'use client'

import Link from 'next/link'
import { Search, Bell, LogIn } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id } : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">{APP_NAME}</span>
        </Link>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition relative">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                <LogIn className="w-4 h-4" />
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
