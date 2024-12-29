export interface BlogDBType {
    id: string
    name:string
    description: string
    websiteUrl: string
}

export interface AddUpdateBlogRequestRequiredData {
    name:string
    description: string
    websiteUrl: string
}
