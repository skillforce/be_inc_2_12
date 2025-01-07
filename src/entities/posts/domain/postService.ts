import {
    AddBlogRequestRequiredData,
    AddUpdatePostRequestRequiredData,
    PostDBType,
    PostOutputDBType, PostsOutputWithPagination
} from "../types/types";
import { postRepository } from "../repository/postRepository";
import { queryFilterGenerator, toObjectId } from "../../../helpers/helpers";
import { postQueryRepository } from "../repository/postQueryRepository";
import { blogQueryRepository } from "../../blogs/repository/blogQueryRepository";
import { SortDirection } from "mongodb";


export const postService = {
    getAllPosts: async (): Promise<PostOutputDBType[]> => {
        const postsFromDb = await postQueryRepository.getPosts();
        return postsFromDb.map(postService.mapPostToOutput)
    },

    getPostById: async (id: string): Promise<PostOutputDBType | null> => {
        const _id = toObjectId(id)

        if(!_id){
            return null
        }
        const postById =await postQueryRepository.getPostById(_id);

        if(!postById){
            return null
        }

        return postService.mapPostToOutput(postById);
    },

    getPostByBlogIdWithQueryAndPagination: async ( query: Record<string, string | undefined>,
                                                   id?: string,
                                                   isWithId?: boolean): Promise<PostsOutputWithPagination> => {


        const sanitizedQuery = queryFilterGenerator(query);

        const {pageNumber, pageSize, sortBy, sortDirection} = sanitizedQuery;
        const searchBlogId = isWithId ? {blogId: {$regex:id}} : {}


        const filter = {
            ...searchBlogId,
        }
        const skip = (pageNumber - 1) * pageSize;
        const itemsFromDb = await postQueryRepository.getPostsByConditionsWithPagination(filter, sortBy, sortDirection as SortDirection, skip, pageSize);
        const totalCount = await postQueryRepository.countPosts(filter);
        const outputItems = itemsFromDb.map(postService.mapPostToOutput)


        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: outputItems
        }
    },

    addPost: async ({blogId,title,content,shortDescription }: AddUpdatePostRequestRequiredData): Promise<PostOutputDBType|null> => {
        const _id = toObjectId(blogId)
        if(!_id){
            return null
        }
        const blogById = await blogQueryRepository.getBlogById(_id)

        const newPostData:AddBlogRequestRequiredData = {
            title,
            shortDescription,
            content,
            blogId,
            blogName:blogById?.name??'',
            createdAt: new Date().toISOString()
        };

        const newPostId = await postRepository.addPost(newPostData)

        const postById = await postQueryRepository.getPostById(newPostId);

        if(!postById){
            return null
        }

        return postService.mapPostToOutput(postById);
    },

    updatePost: async (id: string, videoDataForUpdate: AddUpdatePostRequestRequiredData): Promise<boolean> => {
        const _id = toObjectId(id)

        if(!_id){
            return false
        }

        const postById = await postQueryRepository.getPostById(_id);
        const postBlogId = toObjectId(postById?.blogId.toString()??'')

        if (!postById || !postBlogId) {
            return false;
        }
        const blogById = await blogQueryRepository.getBlogById(postBlogId);

        if (!blogById) {
            return false;
        }
        const updatePostData = {...videoDataForUpdate, blogName:blogById?.name??''}
        return await postRepository.updatePost(_id,updatePostData)
    },

    deletePost: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if(!_id){
            return false
        }
        const postById = await postQueryRepository.getPostById(_id);
        if (!postById) {
            return false;
        }
        return await postRepository.deletePost(_id)
    },
    mapPostToOutput(post: PostDBType): PostOutputDBType {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt
        }
    },
};