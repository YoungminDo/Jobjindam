'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  onDelete: () => Promise<void>
  label?: string
}

export default function DeleteButton({ onDelete, label = '삭제' }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
          startTransition(() => onDelete())
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? '삭제 중...' : label}
    </button>
  )
}
