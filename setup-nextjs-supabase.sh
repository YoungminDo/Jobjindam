#!/bin/bash

# 🎨 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Next.js + Supabase 프로젝트 구조 자동 생성${NC}"
echo ""

# 📁 1단계: 폴더 생성
echo -e "${YELLOW}📁 폴더 생성 중...${NC}"

mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/\(dashboard\)/dashboard
mkdir -p lib/supabase
mkdir -p lib/auth

echo -e "${GREEN}✓ 폴더 생성 완료${NC}"
echo ""

# 📝 2단계: 파일 생성
echo -e "${YELLOW}📝 파일 생성 중...${NC}"

# ===== middleware.ts =====
cat > middleware.ts << 'EOF'
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
EOF
echo -e "${GREEN}✓ middleware.ts${NC}"

# ===== lib/supabase/client.ts =====
cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
EOF
echo -e "${GREEN}✓ lib/supabase/client.ts${NC}"

# ===== lib/supabase/server.ts =====
cat > lib/supabase/server.ts << 'EOF'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component에서는 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component에서는 무시
          }
        },
      },
    }
  )
}
EOF
echo -e "${GREEN}✓ lib/supabase/server.ts${NC}"

# ===== lib/supabase/middleware.ts =====
cat > lib/supabase/middleware.ts << 'EOF'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
EOF
echo -e "${GREEN}✓ lib/supabase/middleware.ts${NC}"

# ===== lib/auth/session.ts =====
cat > lib/auth/session.ts << 'EOF'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireGuest() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }
}
EOF
echo -e "${GREEN}✓ lib/auth/session.ts${NC}"

# ===== app/layout.tsx =====
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '8시간 - 데스크테리어 큐레이션',
  description: '집보다 오래 있는 우리회사, 내 데스크 아이템 큐레이션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
EOF
echo -e "${GREEN}✓ app/layout.tsx${NC}"

# ===== app/page.tsx =====
cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <h1 className="text-6xl font-black text-gray-900 mb-4">
          8시간 ⏰
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          집보다 더 오래 있는 우리회사
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login"
            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition"
          >
            로그인
          </Link>
          <Link 
            href="/register"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
EOF
echo -e "${GREEN}✓ app/page.tsx${NC}"

# ===== app/(auth)/layout.tsx =====
cat > app/\(auth\)/layout.tsx << 'EOF'
import { requireGuest } from '@/lib/auth/session'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireGuest()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  )
}
EOF
echo -e "${GREEN}✓ app/(auth)/layout.tsx${NC}"

# ===== app/(auth)/login/page.tsx =====
cat > app/\(auth\)/login/page.tsx << 'EOF'
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('로그인 실패: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">로그인</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
EOF
echo -e "${GREEN}✓ app/(auth)/login/page.tsx${NC}"

# ===== app/(auth)/register/page.tsx =====
cat > app/\(auth\)/register/page.tsx << 'EOF'
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert('회원가입 실패: ' + error.message)
      setLoading(false)
    } else {
      alert('회원가입 성공! 이메일을 확인해주세요.')
      router.push('/login')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">회원가입</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  )
}
EOF
echo -e "${GREEN}✓ app/(auth)/register/page.tsx${NC}"

# ===== app/(dashboard)/layout.tsx =====
cat > app/\(dashboard\)/layout.tsx << 'EOF'
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
      {/* 사이드바 */}
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

      {/* 메인 콘텐츠 */}
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
EOF
echo -e "${GREEN}✓ app/(dashboard)/layout.tsx${NC}"

# ===== app/(dashboard)/dashboard/page.tsx =====
cat > app/\(dashboard\)/dashboard/page.tsx << 'EOF'
import { requireAuth } from '@/lib/auth/session'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-2xl font-black text-gray-900">78점</div>
          <div className="text-sm text-gray-500">직무역량</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-2xl font-black text-gray-900">65점</div>
          <div className="text-sm text-gray-500">회복탄력성</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">⚡</div>
          <div className="text-2xl font-black text-gray-900">ISTJ-A</div>
          <div className="text-sm text-gray-500">행동지수</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-black text-gray-900 mb-4">
          사용자 정보
        </h2>
        <dl className="space-y-2">
          <div className="flex">
            <dt className="w-32 text-gray-500">이메일:</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 text-gray-500">가입일:</dt>
            <dd className="font-medium">
              {new Date(user.created_at).toLocaleDateString('ko-KR')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
EOF
echo -e "${GREEN}✓ app/(dashboard)/dashboard/page.tsx${NC}"

# ===== .env.local 템플릿 =====
cat > .env.local.example << 'EOF'
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF
echo -e "${GREEN}✓ .env.local.example${NC}"

echo ""
echo -e "${BLUE}✅ 모든 파일 생성 완료!${NC}"
echo ""
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "1. .env.local 파일 생성하고 Supabase 키 입력"
echo "   cp .env.local.example .env.local"
echo ""
echo "2. Supabase 패키지 설치"
echo "   npm install @supabase/ssr @supabase/supabase-js"
echo ""
echo "3. 개발 서버 실행"
echo "   npm run dev"
echo ""
echo -e "${GREEN}🎉 완료! http://localhost:3000 에서 확인하세요${NC}"
