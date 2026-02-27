import { useUser } from '@/contexts/UserContext'

export const useCurrentUserImage = () => {
  const { userImage } = useUser()
  return userImage
}
