export interface AppPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}