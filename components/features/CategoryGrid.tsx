import Link from 'next/link'
import { TAGS } from '@/lib/constants'

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-5 gap-2 px-4">
      {TAGS.map((tag) => (
        <Link
          key={tag.id}
          href={`/search?tag=${tag.id}`}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-gray-50 transition"
        >
          <span className="text-3xl">{tag.emoji}</span>
          <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{tag.name}</span>
        </Link>
      ))}
    </div>
  )
}
