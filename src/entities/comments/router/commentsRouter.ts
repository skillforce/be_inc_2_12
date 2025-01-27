import { Request, Response, Router } from 'express'
import {
    deleteCommentValidators,
    getCommentByIdValidators,
    updateCommentValidators
} from "../middlewares/commentsInputValidationMiddleware";
import { commentsService } from "../domain/commentsService";
import { commentsQueryRepository } from "../repository/commentsQueryRepository";
import { ObjectId } from "mongodb";
import { toObjectId } from "../../../common/helpers";
import { CommentDBOutputType, UpdateCommentRequestRequiredData } from "../types/types";

export const commentsRouter = Router({});


commentsRouter.get('/:id',
    getCommentByIdValidators,
    async (req: Request<{ id: string }>, res: Response<CommentDBOutputType>) => {
        const _id = toObjectId(req.params.id)

        if (!_id) {
            res.sendStatus(404)
            return;
        }

        const responseData = await commentsQueryRepository.getCommentById(_id as ObjectId);

        if (responseData) {
            res.status(200).json(responseData)
            return;
        }
        res.sendStatus(404)

    })

commentsRouter.put('/:id',
    updateCommentValidators,
    async (req: Request<{ id: string }, UpdateCommentRequestRequiredData>, res: Response<any>) => {
        const queryIdForUpdate = req.params.id;
        const newDataForBlogToUpdate = req.body;

        const isUpdatedBlog = await commentsService.updateComment(queryIdForUpdate, newDataForBlogToUpdate)
        if (!isUpdatedBlog) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })


commentsRouter.delete('/:id',
    deleteCommentValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const isCommentDeleted = await commentsService.deleteComment(queryId)

        if (!isCommentDeleted) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
