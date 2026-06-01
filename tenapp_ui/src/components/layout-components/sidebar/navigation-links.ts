import type { NavigationLink } from '../../../common/interfaces/links.ts'
import { LuBuilding2, LuLayoutDashboard, LuUsersRound } from 'react-icons/lu'

export const navigationLinks: NavigationLink[] = [
  {
    path: '/count',
    label: 'Counts',
    icon: LuLayoutDashboard,
  },
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
]
