import { Request, Response, Router } from 'express'
import { blogRepository } from "../repository/blogRepository";
import { validateUrlParamId } from "../../middlewares/commonValidationMiddlewares";
import { AddUpdateBlogRequestRequiredData, BlogDBType } from "../types/types";
import { addBlogBodyValidators, updateBlogBodyValidators } from "../middlewares/blogInputValidationMiddleware";

export const blogRouter = Router({});


blogRouter.get('/', async (req: Request, res: Response<BlogDBType[]>) => {
    const responseData = await blogRepository.getAllBlogs()
    res.status(200).json(responseData);

})

blogRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<BlogDBType>) => {
        const responseData = await blogRepository.getBlogById(req.params.id)
        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

blogRouter.post('/',
    addBlogBodyValidators,
    async (req: Request<any, AddUpdateBlogRequestRequiredData>, res: Response<BlogDBType>) => {
        const {name, websiteUrl, description} = req.body
        const newBlog = await blogRepository.addBlog({name, websiteUrl, description})
        res.status(201).json(newBlog)
    })

blogRouter.put('/:id',
    updateBlogBodyValidators,
    async (req: Request<{ id: string }, AddUpdateBlogRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForBlogToUpdate = req.body;

        const isUpdatedBlog = await blogRepository.updateBlog(queryIdForUpdate, newDataForBlogToUpdate)
        if (!isUpdatedBlog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })

blogRouter.delete('/:id',
    validateUrlParamId,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const blog = await blogRepository.deleteBlog(queryId)
        if (!blog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
