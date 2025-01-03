import { Request, Response, Router } from 'express'
import { AddUpdateBlogRequestRequiredData, BlogDBOutputType, BlogDBType } from "../types/types";
import {
    addBlogBodyValidators,
    deleteBlogValidators,
    updateBlogBodyValidators
} from "../middlewares/blogInputValidationMiddleware";
import { blogService } from "../domain/blogService";

export const blogRouter = Router({});


blogRouter.get('/', async (req: Request, res: Response<BlogDBOutputType[]>) => {
    const responseData = await blogService.getAllBlogs()
    res.status(200).json(responseData);

})

blogRouter.get('/:id',
    async (req: Request<{ id: string }>, res: Response<BlogDBOutputType>) => {
        const responseData = await blogService.getBlogById(req.params.id)
        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

blogRouter.post('/',
    addBlogBodyValidators,
    async (req: Request<any, AddUpdateBlogRequestRequiredData>, res: Response<BlogDBOutputType>) => {
        const {name, websiteUrl, description} = req.body
        const newBlog = await blogService.addBlog({name, websiteUrl, description})
        if(!newBlog){
            res.sendStatus(500)
        }
        res.status(201).json(newBlog as BlogDBOutputType)
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
