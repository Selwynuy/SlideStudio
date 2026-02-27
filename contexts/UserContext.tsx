'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  userName: string | null
  userImage: string | null
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error fetching session:', error)
      setUser(null)
      setUserName(null)
      setUserImage(null)
      setIsLoading(false)
      return
    }

    if (session?.user) {
      setUser(session.user)
      setUserName(session.user.user_metadata?.full_name ?? null)
      setUserImage(session.user.user_metadata?.avatar_url ?? null)
    } else {
      setUser(null)
      setUserName(null)
      setUserImage(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    // Fetch user data once on mount
    fetchUserData()

    // Listen for auth state changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Immediately update from the session if available, then fetch
        if (session?.user) {
          setUser(session.user)
          setUserName(session.user.user_metadata?.full_name ?? null)
          setUserImage(session.user.user_metadata?.avatar_url ?? null)
          setIsLoading(false)
        }
        await fetchUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserName(null)
        setUserImage(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, userName, userImage, isLoading, refreshUser: fetchUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
