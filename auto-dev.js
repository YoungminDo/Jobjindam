#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.log('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다')
  console.log('PowerShell에서: $env:ANTHROPIC_API_KEY = "your-key"')
  process.exit(1)
}

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
})

async function runAgent(role, systemPrompt, userMessage) {
  console.log(`\n🤖 ${role} 작업 중...`)
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${systemPrompt}\n\n사용자 요청:\n${userMessage}\n\n반드시 JSON 형식으로만 응답하세요.`
      }
    ]
  })

  const content = response.content[0].text
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    console.log('⚠️ JSON 파싱 실패')
    return null
  }
  
  const result = JSON.parse(jsonMatch[0])
  console.log(`✅ ${role} 완료`)
  return result
}

async function createFiles(files) {
  console.log('\n📁 파일 생성 중...')
  
  for (const file of files) {
    const fullPath = path.join(__dirname, file.path)
    const dir = path.dirname(fullPath)
    
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, file.code, 'utf-8')
    console.log(`  ✓ ${file.path}`)
  }
  
  console.log('✅ 파일 생성 완료')
}

async function main() {
  const userRequest = process.argv.slice(2).join(' ')
  
  if (!userRequest) {
    console.log('사용법: node auto-dev.js "요청 내용"')
    console.log('예시: node auto-dev.js "좋아요 기능 만들어줘"')
    process.exit(1)
  }

  console.log('🚀 완전 자동화 AI 개발팀 시작\n')
  console.log(`📋 요청: ${userRequest}\n`)
  console.log('='.repeat(60))

  try {
    // 기획자
    const prd = await runAgent(
      '기획자',
      `제품 기획 전문가입니다. PRD를 작성하세요.
출력: {"feature_name": "기능명", "purpose": "목적", "user_stories": [], "api_requirements": []}`,
      userRequest
    )

    if (!prd) throw new Error('기획 실패')

    // 프론트엔드
    const frontend = await runAgent(
      '프론트엔드',
      `Next.js 14 전문 개발자입니다.
출력: {"files": [{"path": "components/Example.tsx", "code": "코드..."}]}`,
      `PRD: ${JSON.stringify(prd)}\n\n구현하세요.`
    )

    // 백엔드
    const backend = await runAgent(
      '백엔드',
      `Supabase 전문 개발자입니다.
출력: {"migrations": [{"name": "create_table", "sql": "SQL..."}], "server_actions": [{"path": "app/actions/example.ts", "code": "코드..."}]}`,
      `PRD: ${JSON.stringify(prd)}\n\n백엔드 구현하세요.`
    )

    console.log('\n' + '='.repeat(60))

    // 파일 생성
    const allFiles = [
      ...(frontend?.files || []),
      ...(backend?.server_actions || [])
    ]

    if (allFiles.length > 0) {
      await createFiles(allFiles)
    }

    // SQL 파일 생성
    if (backend?.migrations) {
      console.log('\n🗄️ SQL 파일 생성 중...')
      
      const migrationsDir = path.join(__dirname, 'supabase/migrations')
      await fs.mkdir(migrationsDir, { recursive: true })
      
      for (const migration of backend.migrations) {
        const timestamp = Date.now()
        const filename = `${timestamp}_${migration.name}.sql`
        await fs.writeFile(
          path.join(migrationsDir, filename),
          migration.sql,
          'utf-8'
        )
        console.log(`  ✓ ${filename}`)
      }
      
      console.log('✅ SQL 파일 생성 완료')
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n🎉 완료!\n')
    console.log('다음 단계:')
    console.log('1. npm run dev')
    console.log('2. Supabase 대시보드에서 SQL 실행')
    console.log('3. http://localhost:3000 테스트\n')

  } catch (error) {
    console.error('\n❌ 에러:', error.message)
    process.exit(1)
  }
}

main()