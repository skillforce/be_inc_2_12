import {DBType} from '../src/db/db'
import { BlogDBType } from "../src/blogs";

// готовые данные для переиспользования в тестах


export const blog1: BlogDBType /*VideoDBType*/ = {
    id: '1',
    name: 'name1',
    description: 'description1',
    websiteUrl: 'websiteUrl1',
}

export const dataset1: DBType = {
    blogs: [blog1],
}
