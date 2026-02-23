'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
  name: string
  target_job: string | null
  preparation_stage: string | null
  interests?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.name,
      target_job: formData.target_job,
      preparation_stage: formData.preparation_stage,
      interests: formData.interests || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: '프로필 업데이트에 실패했습니다.' }
  }

  revalidatePath('/my')
  return { success: true }
}
