export interface PaginatedData<I> {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: I
}