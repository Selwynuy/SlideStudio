'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { listSlideshows, type Slideshow } from '@/lib/slideshows'
import { useUser } from './UserContext'

interface ProjectsContextType {
  projects: Slideshow[]
  isLoading: boolean
  error: string | null
  refreshProjects: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [projects, setProjects] = useState<Slideshow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchProjects = async () => {
    if (!user) {
      setProjects([])
      setHasFetched(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await listSlideshows()
      setProjects(data)
      setHasFetched(true)
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch once when user is available and we haven't fetched yet
    if (user && !hasFetched) {
      fetchProjects()
    } else if (!user) {
      // Clear projects when user logs out
      setProjects([])
      setHasFetched(false)
    }
  }, [user, hasFetched])

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, error, refreshProjects: fetchProjects }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}
