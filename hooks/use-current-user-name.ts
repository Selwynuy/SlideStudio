import { useUser } from '@/contexts/UserContext'

export const useCurrentUserName = () => {
  const { userName } = useUser()
  return userName || '?'
}
