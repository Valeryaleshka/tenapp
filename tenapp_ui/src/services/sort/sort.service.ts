export type SortDirection = 'asc' | 'desc';

export function getNextSortDirection(currentField: string, nextField: string, currentDirection: SortDirection): SortDirection {
    if (currentField !== nextField) {
        return 'asc';
    }

    return currentDirection === 'asc' ? 'desc' : 'asc';
}

export function getSortArrowClasses(isActive: boolean, direction: SortDirection, arrowDirection: SortDirection): string {
    if (!isActive) {
        return 'app-sort-arrow';
    }

    return direction === arrowDirection ? 'app-sort-arrow active' : 'app-sort-arrow';
}
