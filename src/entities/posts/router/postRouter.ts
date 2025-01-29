import { Request, Response, Router } from 'express'
import { AddUpdatePostRequestRequiredData, PostOutputDBType, PostsOutputWithPagination } from "../types/types";
import {
    addPostBodyValidators,
    deletePostValidators,
    updatePostBodyValidators
} from "../middlewares/postInputValidationMiddleware";
import { postService } from "../domain/postService";
import { postQueryRepository } from "../repository/postQueryRepository";
import { toObjectId } from "../../../common/helpers";
import { blogQueryRepository } from "../../blogs/repository/blogQueryRepository";
import { RequestWithParams } from "../../../common/types/request";
import { HttpStatuses } from "../../../common/types/httpStatuses";

export const postRouter = Router({});


postRouter.get('/', async (req: Request, res: Response<PostsOutputWithPagination>) => {
    const queryObj = req.query
    const responseData = await postQueryRepository.getPaginatedPosts(queryObj as Record<string, string | undefined>)
    res.status(HttpStatuses.Success).json(responseData)

})

postRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<PostOutputDBType>) => {
        const _id = toObjectId(req.params.id)
             if(!_id){
                 res.sendStatus(HttpStatuses.NotFound)
                 return;
             }
        const responseData = await postQueryRepository.getPostById(_id)
        if (responseData) {
            res.status(HttpStatuses.Success).json(responseData)
            return;
        }
        res.sendStatus(HttpStatuses.NotFound)

    })

postRouter.get('/:id/comments',
    async (req: RequestWithParams<{ id: string }>, res: Response<PostOutputDBType>) => {
        const postId = toObjectId(req.params.id)
        
        if(!postId){
                 res.sendStatus(HttpStatuses.NotFound)
                 return;
         }

        // const responseData = await postQueryRepository.getPostById(_id)
        // if (responseData) {
        //     res.status(HttpStatuses.Success).json(responseData)
        //     return;
        // }
        // res.sendStatus(HttpStatuses.NotFound)

    })

postRouter.post('/',
    addPostBodyValidators,
    async (req: Request<any, AddUpdatePostRequestRequiredData>, res: Response<PostOutputDBType>) => {
        const {blogId} = req.body
        const _id = toObjectId(blogId)
        if(!_id){
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        const blogById = await blogQueryRepository.getBlogById(_id)

        if(!blogById){
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }

        const newPost = await postService.addPost(req.body,blogById)

        if(!newPost){
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        const createdPostForOutput = await postQueryRepository.getPostById(newPost);

        if(!createdPostForOutput){
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }


        res.status(HttpStatuses.Created).json(createdPostForOutput)
    })

postRouter.put('/:id',
    updatePostBodyValidators,
    async (req: Request<{ id: string }, AddUpdatePostRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForPostToUpdate = req.body;
        const _id = toObjectId(queryIdForUpdate)

        if(!_id){
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }

        const postById = await postQueryRepository.getPostById(_id);
        const postBlogId = toObjectId(newDataForPostToUpdate.blogId);

        if (!postById || !postBlogId) {
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        const blogById = await blogQueryRepository.getBlogById(postBlogId);

        if (!blogById) {
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        const isBlogUpdated = await postService.updatePost(_id, blogById, newDataForPostToUpdate);

        if (!isBlogUpdated) {
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        res.sendStatus(HttpStatuses.NoContent)
    })

postRouter.delete('/:id',
    deletePostValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {
        const queryId = req.params.id
        const post = await postService.deletePost(queryId)
        if (!post) {
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        res.sendStatus(HttpStatuses.NoContent)
    })
