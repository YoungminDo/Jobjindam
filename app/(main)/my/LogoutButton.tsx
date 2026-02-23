'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-4 py-4 hover:bg-gray-50 transition text-left"
    >
      <LogOut className="w-5 h-5 text-red-400" />
      <span className="text-sm font-medium text-red-500">로그아웃</span>
    </button>
  )
}
