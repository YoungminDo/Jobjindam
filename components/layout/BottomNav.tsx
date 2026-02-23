'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, GraduationCap, Newspaper, MessageCircle, User } from 'lucide-react'

const navItems = [
  { name: '홈', href: '/', icon: Home },
  { name: '강의', href: '/courses', icon: GraduationCap },
  { name: '콘텐츠', href: '/contents', icon: Newspaper },
  { name: '채팅', href: '/chat', icon: MessageCircle },
  { name: 'MY', href: '/my', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
