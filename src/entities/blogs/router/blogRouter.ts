import { Request, Response, Router } from 'express'
import { AddUpdateBlogRequestRequiredData, BlogDBOutputType, BlogsOutputWithPagination } from "../types/types";
import {
    addBlogBodyValidators,
    deleteBlogValidators,
    updateBlogBodyValidators
} from "../middlewares/blogInputValidationMiddleware";
import { blogService } from "../domain/blogService";
import {
    createPostByBlogIdValidators,
    getPostsByBlogIdValidators
} from "../../posts/middlewares/postInputValidationMiddleware";
import { AddUpdatePostRequestRequiredData, PostOutputDBType, PostsOutputWithPagination } from "../../posts/types/types";
import { postService } from "../../posts/domain/postService";
import { blogQueryRepository } from "../repository/blogQueryRepository";
import { ObjectId } from "mongodb";
import { queryFilterGenerator, toObjectId } from "../../../helpers/helpers";
import { postQueryRepository } from "../../posts/repository/postQueryRepository";

export const blogRouter = Router({});


blogRouter.get('/', async (req: Request, res: Response<BlogsOutputWithPagination>) => {
    const queryObj = req.query
    const sanitizedQuery = queryFilterGenerator(queryObj as Record<string, string | undefined>);

    const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} = sanitizedQuery;

    const searchText = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}} : {}
    const filter = {...searchText}

    const skip = (pageNumber - 1) * pageSize;

    const responseData = await blogQueryRepository.getPaginatedBlogs({
        filter,
        sortBy,
        sortDirection,
        skip,
        pageNumber,
        limit: pageSize
    })
    res.status(200).json(responseData);

})

blogRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<BlogDBOutputType>) => {
        const _id = toObjectId(req.params.id)

        if (!_id) {
            res.sendStatus(404)
            return;
        }

        const responseData = await blogQueryRepository.getBlogById(_id as ObjectId);

        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

blogRouter.get('/:id/posts',
    getPostsByBlogIdValidators,
    async (req: Request<{ id: string }>, res: Response<PostsOutputWithPagination>) => {
        const queryObj = req.query
        const id = req.params.id


        const sanitizedQuery = queryFilterGenerator(queryObj as Record<string, string | undefined>);

        const {pageNumber, pageSize, sortBy, sortDirection} = sanitizedQuery;
        const skip = (pageNumber - 1) * pageSize;

        const searchBlogId = {blogId: {$regex:id}}
        const filter = {...searchBlogId}

        const responseData = await postQueryRepository.getPaginatedPosts({
            filter: filter,
            sortBy,
            sortDirection,
            skip,
            limit:pageSize,
            pageNumber
        })

        res.status(200).json(responseData)

    })

blogRouter.post('/',
    addBlogBodyValidators,
    async (req: Request<any, AddUpdateBlogRequestRequiredData>, res: Response<BlogDBOutputType>) => {
        const {name, websiteUrl, description} = req.body
        const newBlogId = await blogService.addBlog({name, websiteUrl, description})

        if (!newBlogId) {
            res.sendStatus(500)
            return;
        }
        const blogById = await blogQueryRepository.getBlogById(newBlogId as ObjectId);

        if (!blogById) {
            res.sendStatus(500)
            return;
        }

        res.status(201).json(blogById as BlogDBOutputType)
    })

blogRouter.post('/:id/posts',
    createPostByBlogIdValidators,
    async (req: Request<{ id: string }, Omit<AddUpdatePostRequestRequiredData, 'blogId'>>, res: Response<PostOutputDBType>) => {
        const blogId = req.params.id;
        const _id = toObjectId(blogId)

        if(!_id){
            res.sendStatus(404)
            return;
        }
        const blogById = await blogQueryRepository.getBlogById(_id)

        if(!blogById){
            res.sendStatus(404)
            return;
        }

        const newPost = await postService.addPost(req.body,blogById)

        if(!newPost){
            res.sendStatus(404)
            return;
        }
        const createdPostForOutput = await postQueryRepository.getPostById(newPost);

        if(!createdPostForOutput){
            res.sendStatus(404)
            return;
        }

        res.status(201).json(createdPostForOutput)






    // const {title, shortDescription, content} = req.body;
    //     const blogId = req.params.id;
    //
    //     const newPost = await postService.addPost({title, shortDescription, content, blogId})
    //     if (!newPost) {
    //         res.sendStatus(404)
    //     }
    //     res.status(201).json(newPost as PostOutputDBType)
    })

blogRouter.put('/:id',
    updateBlogBodyValidators,
    async (req: Request<{ id: string }, AddUpdateBlogRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForBlogToUpdate = req.body;

        const isUpdatedBlog = await blogService.updateBlog(queryIdForUpdate, newDataForBlogToUpdate)
        if (!isUpdatedBlog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })

blogRouter.delete('/:id',
    deleteBlogValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const blog = await blogService.deleteBlog(queryId)
        if (!blog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
