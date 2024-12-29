import { Request, Response, Router } from 'express'
import { setDB } from "../../db/db";

export const testingRouter = Router({});

testingRouter.delete('/all-data',
    async (req: Request<{ id: string }>, res: Response<any>) => {
        setDB()
        res.sendStatus(204)
})
