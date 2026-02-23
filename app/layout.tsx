import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '취준진담 - 취업, 혼자가 아닌 함께',
  description: '취업 준비생을 위한 강의, 콘텐츠, 정보, 네트워킹을 한 곳에서',
  keywords: ['취업', '취준', '강의', '면접', '이력서', '취업준비', '멘토링'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
