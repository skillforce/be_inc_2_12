export interface PostDBType {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
}

export interface AddUpdatePostRequestRequiredData {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}
