import type { AvatarProps } from '@nuxt/ui'

/** Represents an authenticated user with basic profile information. */
export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
}
