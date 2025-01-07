import { ObjectId, SortDirection } from "mongodb";

export const toObjectId = (id: string): ObjectId | null => {
    if (ObjectId.isValid(id) && id.length === 24) {
        return new ObjectId(id);
    }
    return null;
};


interface QueryFilterGenerator{
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: SortDirection;
    searchNameTerm: string | null;
}

export const queryFilterGenerator=(query:Record<string,string|undefined>):QueryFilterGenerator=>{
    return {
        pageNumber:query.pageNumber? +query.pageNumber : 1,
        pageSize:query.pageSize !== undefined? +query.pageSize : 10,
        sortBy:query.sortBy ?? 'createdAt',
        sortDirection:query.sortDirection==='asc'? query.sortDirection : 'desc',
        searchNameTerm: query.searchNameTerm ??  null,
    }
}