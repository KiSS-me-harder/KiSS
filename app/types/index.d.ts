import type { AvatarProps } from '@nuxt/ui'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}
