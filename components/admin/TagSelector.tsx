'use client'

import { useState } from 'react'
import { TAGS } from '@/lib/constants'

interface TagSelectorProps {
  selectedTagIds: string[]
  allTags: { id: string; name: string; emoji: string; color: string }[]
  onChange: (tagIds: string[]) => void
}

export default function TagSelector({ selectedTagIds, allTags, onChange }: TagSelectorProps) {
  const tags = allTags.length > 0 ? allTags : TAGS.map((t, i) => ({ id: `preset-${t.id}`, name: t.name, emoji: t.emoji, color: t.color }))

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">태그 선택</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                isSelected
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
              style={isSelected ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
            >
              <span>{tag.emoji}</span>
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
