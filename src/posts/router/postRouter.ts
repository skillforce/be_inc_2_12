import { Request, Response, Router } from 'express'
import { postRepository } from "../repository/postRepository";
import { validateUrlParamId } from "../../middlewares/commonValidationMiddlewares";
import { AddUpdatePostRequestRequiredData, PostDBType } from "../types/types";
import {
    addPostBodyValidators,
    deletePostValidators,
    updatePostBodyValidators
} from "../middlewares/postInputValidationMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";

export const postRouter = Router({});


postRouter.get('/', async (req: Request, res: Response<PostDBType[]>) => {
    const responseData = await postRepository.getAllPosts()
    res.status(200).json(responseData);

})

postRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<PostDBType>) => {
        const responseData = await postRepository.getPostById(req.params.id)
        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

postRouter.post('/',
    addPostBodyValidators,
    async (req: Request<any, AddUpdatePostRequestRequiredData>, res: Response<PostDBType>) => {
        const {title, shortDescription, content, blogId} = req.body
        const newPost = await postRepository.addPost({title, shortDescription, content, blogId})
        res.status(201).json(newPost)
    })

postRouter.put('/:id',
    updatePostBodyValidators,
    async (req: Request<{ id: string }, AddUpdatePostRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForPostToUpdate = req.body;

        const isUpdatedBlog = await postRepository.updatePost(queryIdForUpdate, newDataForPostToUpdate)
        if (!isUpdatedBlog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })

postRouter.delete('/:id',
    deletePostValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const post = await postRepository.deletePost(queryId)
        if (!post) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
