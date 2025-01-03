import { Request, Response, Router } from 'express'
import { AddUpdatePostRequestRequiredData, PostDBType, PostOutputDBType } from "../types/types";
import {
    addPostBodyValidators,
    deletePostValidators,
    updatePostBodyValidators
} from "../middlewares/postInputValidationMiddleware";
import { postService } from "../domain/postService";

export const postRouter = Router({});


postRouter.get('/', async (req: Request, res: Response<PostOutputDBType[]>) => {
    const responseData = await postService.getAllPosts()
    res.status(200).json(responseData);

})

postRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<PostOutputDBType>) => {
        const responseData = await postService.getPostById(req.params.id)
        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

postRouter.post('/',
    addPostBodyValidators,
    async (req: Request<any, AddUpdatePostRequestRequiredData>, res: Response<PostOutputDBType>) => {
        const {title, shortDescription, content, blogId} = req.body
        const newPost = await postService.addPost({title, shortDescription, content, blogId})
        if(!newPost){
            res.sendStatus(500)
        }
        res.status(201).json(newPost as PostOutputDBType)
    })

postRouter.put('/:id',
    updatePostBodyValidators,
    async (req: Request<{ id: string }, AddUpdatePostRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForPostToUpdate = req.body;

        const isUpdatedBlog = await postService.updatePost(queryIdForUpdate, newDataForPostToUpdate)
        if (!isUpdatedBlog) {
            res.sendStatus(500)
            return;
        }
        res.sendStatus(204)
    })

postRouter.delete('/:id',
    deletePostValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const post = await postService.deletePost(queryId)
        if (!post) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
