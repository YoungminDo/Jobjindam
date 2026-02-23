# 프로젝트 템플릿

## 기본 구조

```
my-mvp/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── features/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   └── useUser.ts
│   ├── types/
│   │   ├── database.ts          # Supabase 자동 생성 타입
│   │   └── index.ts
│   └── middleware.ts
├── public/
│   ├── favicon.ico
│   └── images/
├── supabase/
│   ├── migrations/              # DB 마이그레이션
│   └── seed.sql                 # 시드 데이터
├── .env.local.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 필수 항목 체크리스트

### 프로젝트 초기화
- [ ] Next.js 14 프로젝트 생성 (App Router)
- [ ] TypeScript strict mode 설정
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 초기화 (`npx shadcn@latest init`)
- [ ] Supabase 클라이언트 설정
- [ ] 환경변수 파일 생성 (.env.local)
- [ ] .gitignore 확인 (.env.local 포함)

### 인증 시스템
- [ ] Supabase Auth 설정
- [ ] 로그인 페이지 (/login)
- [ ] 회원가입 페이지 (/signup)
- [ ] 미들웨어 (인증 체크 + 세션 갱신)
- [ ] 로그아웃 기능
- [ ] 보호된 라우트 설정

### 레이아웃
- [ ] 루트 레이아웃 (메타데이터, 폰트)
- [ ] 헤더 (로고, 네비게이션, 사용자 메뉴)
- [ ] 푸터
- [ ] 반응형 모바일 네비게이션
- [ ] 로딩 상태 (loading.tsx)
- [ ] 에러 처리 (error.tsx)
- [ ] 404 페이지 (not-found.tsx)

### 데이터베이스
- [ ] Supabase 프로젝트 생성
- [ ] 테이블 스키마 설계
- [ ] RLS 정책 작성
- [ ] 타입 생성 (`supabase gen types`)
- [ ] 시드 데이터 (선택)

### 보안
- [ ] 환경변수 분리 (public vs server)
- [ ] RLS 정책 활성화
- [ ] 인증 미들웨어
- [ ] 입력값 검증
- [ ] CORS 설정 확인

### 성능
- [ ] next/image 사용
- [ ] next/font 사용
- [ ] 메타데이터 설정
- [ ] 적절한 캐싱 전략

### 배포 전
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 타입 에러 없음 확인
- [ ] 환경변수 설정 완료
- [ ] Vercel 프로젝트 연결
- [ ] Supabase URL 허용 도메인 추가

---

## 핵심 파일 코드

### lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  )
}
```

### middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 보호된 경로 체크
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### .env.local.example
```env
# Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=My MVP
```
