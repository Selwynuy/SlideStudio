'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={logout}
      title="Sign out"
    >
      Sign Out
    </button>
  )
}
