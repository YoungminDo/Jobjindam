'use client'

import { useTransition } from 'react'
import { approveAdmin, rejectAdmin } from '@/app/actions/admin'
import { UserCheck, UserX, Shield, Clock, Ban } from 'lucide-react'

interface Member {
  id: string
  email: string
  name: string | null
  admin_role: string
  is_admin: boolean
  created_at: string
}

export default function MemberManager({ members }: { members: Member[] }) {
  const pending = members.filter((m) => m.admin_role === 'pending')
  const approved = members.filter((m) => m.admin_role === 'approved')
  const superAdmins = members.filter((m) => m.admin_role === 'super')
  const rejected = members.filter((m) => m.admin_role === 'rejected')

  return (
    <div className="space-y-8">
      {/* 승인 대기 */}
      {pending.length > 0 && (
        <Section
          title="승인 대기"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          count={pending.length}
          color="amber"
        >
          {pending.map((member) => (
            <MemberRow key={member.id} member={member} showActions />
          ))}
        </Section>
      )}

      {/* 슈퍼관리자 */}
      <Section
        title="슈퍼관리자"
        icon={<Shield className="w-5 h-5 text-purple-500" />}
        count={superAdmins.length}
        color="purple"
      >
        {superAdmins.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
        {superAdmins.length === 0 && (
          <p className="px-6 py-4 text-sm text-gray-400">없음</p>
        )}
      </Section>

      {/* 승인된 관리자 */}
      <Section
        title="승인된 관리자"
        icon={<UserCheck className="w-5 h-5 text-green-500" />}
        count={approved.length}
        color="green"
      >
        {approved.map((member) => (
          <MemberRow key={member.id} member={member} showRevoke />
        ))}
        {approved.length === 0 && (
          <p className="px-6 py-4 text-sm text-gray-400">없음</p>
        )}
      </Section>

      {/* 거절된 */}
      {rejected.length > 0 && (
        <Section
          title="거절됨"
          icon={<Ban className="w-5 h-5 text-red-500" />}
          count={rejected.length}
          color="red"
        >
          {rejected.map((member) => (
            <MemberRow key={member.id} member={member} showReApprove />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  icon,
  count,
  color,
  children,
}: {
  title: string
  icon: React.ReactNode
  count: number
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <span className={`ml-auto inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
          {count}명
        </span>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function MemberRow({
  member,
  showActions,
  showRevoke,
  showReApprove,
}: {
  member: Member
  showActions?: boolean
  showRevoke?: boolean
  showReApprove?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(() => approveAdmin(member.id))
  }

  const handleReject = () => {
    if (confirm(`${member.name || member.email}의 관리자 권한을 거절하시겠습니까?`)) {
      startTransition(() => rejectAdmin(member.id))
    }
  }

  const roleLabel = {
    super: '슈퍼관리자',
    approved: '관리자',
    pending: '대기중',
    rejected: '거절됨',
  }[member.admin_role] || member.admin_role

  const roleBadgeClass = {
    super: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  }[member.admin_role] || 'bg-gray-100 text-gray-600'

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
        {(member.name || member.email)?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.name || '이름 없음'}
        </p>
        <p className="text-xs text-gray-500 truncate">{member.email}</p>
      </div>
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass}`}>
        {roleLabel}
      </span>
      <span className="text-xs text-gray-400">
        {new Date(member.created_at).toLocaleDateString('ko-KR')}
      </span>

      {/* 승인/거절 버튼 */}
      {showActions && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            승인
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            <UserX className="w-3.5 h-3.5" />
            거절
          </button>
        </div>
      )}

      {/* 권한 회수 (승인된 관리자) */}
      {showRevoke && (
        <button
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
        >
          <UserX className="w-3.5 h-3.5" />
          권한 회수
        </button>
      )}

      {/* 재승인 (거절된 사용자) */}
      {showReApprove && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition disabled:opacity-50"
        >
          <UserCheck className="w-3.5 h-3.5" />
          재승인
        </button>
      )}
    </div>
  )
}
