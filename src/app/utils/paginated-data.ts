export interface PaginatedData<T> {
    items: T[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
