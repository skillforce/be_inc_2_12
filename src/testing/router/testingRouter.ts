import { Request, Response, Router } from 'express'
import { blogCollection, postCollection } from "../../db/mongo-db";

export const testingRouter = Router({});

testingRouter.delete('/all-data',
    async (req: Request<{ id: string }>, res: Response<any>) => {
        await postCollection.deleteMany()
        await blogCollection.deleteMany()
        res.sendStatus(204)
})
