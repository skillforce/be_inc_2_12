import { SortDirection } from 'mongodb';

interface QueryFilterGenerator {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  searchNameTerm: string | null;
  searchEmailTerm: string | null;
  searchLoginTerm: string | null;
}

export const queryFilterGenerator = (
  query: Record<string, string | undefined>,
): QueryFilterGenerator => {
  return {
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
    sortBy: query.sortBy ?? 'createdAt',
    sortDirection: query.sortDirection === 'asc' ? query.sortDirection : 'desc',
    searchNameTerm: query.searchNameTerm ?? null,
    searchEmailTerm: query.searchEmailTerm ?? null,
    searchLoginTerm: query.searchLoginTerm ?? null,
  };
};
