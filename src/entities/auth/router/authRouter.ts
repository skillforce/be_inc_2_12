import { Request, Response, Router } from 'express'
import { LoginBodyRequiredData } from "../types/types";
import { loginBodyValidators } from "../middlewares/authInputValidationMiddleware";
import { authService } from "../domain/authService";

export const authRouter = Router({});

authRouter.post('/',
    loginBodyValidators,
    async (req: Request<any, LoginBodyRequiredData>, res: Response<any>) => {
       const {loginOrEmail, password} = req.body

       const isUserExists = await authService.isUserExists({loginOrEmail, password})

        if(isUserExists){
            res.sendStatus(204)
            return;
        }
        res.sendStatus(401)

    })
