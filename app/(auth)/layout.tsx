import Link from 'next/link'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
          </Link>
          <p className="text-sm text-gray-500 mt-1">{APP_TAGLINE}</p>
        </div>

        {/* 컨텐츠 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  )
}
