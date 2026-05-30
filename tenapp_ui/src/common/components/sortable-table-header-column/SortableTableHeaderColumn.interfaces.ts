import type { SortDirection } from '../../services/sort/sort.service.ts'

export interface SortableTableHeaderColumnProps<TSortField extends string> {
  activeField: TSortField
  direction: SortDirection
  field: TSortField
  label: string
  onSort: (field: TSortField) => void
}
