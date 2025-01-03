import { BlogDBType } from "../blogs";
import { PostDBType } from "../posts/types/types";

export type DBType = {
    blogs:BlogDBType[]
    posts:PostDBType[]
}

export const db: DBType = {
    blogs:[],
    posts:[]
}

export const setDB = (dataset?: Partial<DBType>) => {
    if (!dataset) {
        db.blogs = []
        db.posts = []
        return
    }
    db.blogs = dataset.blogs || db.blogs
    db.posts = dataset.posts || db.posts
}
