import { getSortArrowClasses } from '../../services/sort/sort.service.ts'
import { getSortableHeaderClassName } from './SortableTableHeaderColumn.helpers.ts'
import type { SortableTableHeaderColumnProps } from './SortableTableHeaderColumn.interfaces.ts'
import './SortableTableHeaderColumn.css'

export function SortableTableHeaderColumn<TSortField extends string>({
  activeField,
  direction,
  field,
  label,
  onSort,
}: SortableTableHeaderColumnProps<TSortField>) {
  const isActive = activeField === field

  return (
    <button
      type="button"
      className={getSortableHeaderClassName(isActive)}
      onClick={() => onSort(field)}
    >
      <span>{label}</span>
      <span className="app-sort-arrows" aria-hidden>
        <span className={getSortArrowClasses(isActive, direction, 'asc')}>^</span>
        <span className={`${getSortArrowClasses(isActive, direction, 'desc')} app-sort-arrow-down`}>
          ^
        </span>
      </span>
    </button>
  )
}
