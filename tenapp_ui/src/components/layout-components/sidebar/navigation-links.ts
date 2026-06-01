import type { NavigationLink } from '../../../common/interfaces/links.ts'
import { LuBuilding2, LuCalendarDays, LuUsersRound } from 'react-icons/lu'

export const navigationLinks: NavigationLink[] = [
  {
    path: '/properties',
    label: 'Properties',
    icon: LuBuilding2,
  },
  {
    path: '/tenants',
    label: 'Tenants',
    icon: LuUsersRound,
  },
  {
    path: '/tenants-created-at-account',
    label: 'Tenant Accounts',
    icon: LuCalendarDays,
  },
]
