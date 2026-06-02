import type { NavigationLink } from '../../../common/interfaces/links.ts'
import { LuBuilding2, LuClipboardCheck, LuUsersRound } from 'react-icons/lu'

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
    path: '/testreview',
    label: 'Testreview',
    icon: LuClipboardCheck,
  },
]
