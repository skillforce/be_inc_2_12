import {DBType} from '../src/db/db'
import { BlogDBType } from "../src/blogs";
import { PostDBType } from "../src/posts";

// готовые данные для переиспользования в тестах


export const blog1: BlogDBType /*VideoDBType*/ = {
    id: '1',
    name: 'name1',
    description: 'description1',
    websiteUrl: 'websiteUrl1',
}

export const post1: PostDBType /*VideoDBType*/ = {
    id: '1',
    title: 'title1',
    shortDescription: 'shortDescription1',
    content: 'content1',
    blogName: 'name1',
    blogId: '1',
}

export const dataset1: DBType = {
    blogs: [blog1],
    posts: [post1],
}
