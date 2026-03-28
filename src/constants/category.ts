import { UsersRound, Image, LucideIcon } from 'lucide-react'

export type CategoryType = {
  name: string
  route: string
  icon: LucideIcon
  role: string[]
}

export const category: CategoryType[] = [
  { name: '유저', route: '/user', icon: UsersRound, role: ['Admin'] },
  { name: '더미', route: '/dummy', icon: Image, role: ['Admin'] },
]
