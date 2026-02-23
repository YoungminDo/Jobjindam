import { createClient } from '@/lib/supabase/server'
import MemberManager from '@/components/admin/MemberManager'

export default async function AdminMembersPage() {
  const supabase = await createClient()

  // 모든 admin_role이 있는 사용자 (pending, approved, rejected, super)
  const { data: members } = await supabase
    .from('profiles')
    .select('id, email, name, admin_role, is_admin, created_at')
    .not('admin_role', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">멤버 관리</h1>
        <p className="text-sm text-gray-500 mt-1">관리자 가입 신청을 승인하거나 거절할 수 있습니다.</p>
      </div>

      <MemberManager members={members || []} />
    </div>
  )
}
