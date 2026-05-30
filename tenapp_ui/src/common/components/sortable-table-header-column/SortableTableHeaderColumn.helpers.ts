export function getSortableHeaderClassName(isActive: boolean): string {
  return `app-sort-header ${isActive ? 'active' : ''}`
}
