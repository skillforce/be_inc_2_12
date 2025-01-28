import { Request, Response, Router } from 'express'
import { LoginBodyRequiredData } from "../types/types";
import { loginBodyValidators, meRequestValidators } from "../middlewares/authInputValidationMiddleware";
import { authService } from "../domain/authService";
import { ResultStatus } from "../../../common/result/resultCode";
import { resultCodeToHttpException } from "../../../common/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { RequestWithUserId } from "../../../common/types/request";
import { IdType } from "../../../common/types/id";
import { usersQueryRepository } from "../../../entities/users/repository/usersQueryRepository";
import { toObjectId } from "../../../common/helpers";
import { UsersOutputMapEnum } from "../../../entities/users";

export const authRouter = Router({});

authRouter.post('/login',
    loginBodyValidators,
    async (req: Request<any, LoginBodyRequiredData>, res: Response) => {
        const {loginOrEmail, password} = req.body

        const result = await authService.loginUser({loginOrEmail, password});

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .send(result.extensions);
            return
        }

        res
            .status(HttpStatuses.Success)
            .send(result.data?.accessToken!)

    })


authRouter.get('/me',
    meRequestValidators,
    async (req: RequestWithUserId<IdType>, res: Response) => {
        const userId = req.user?.id

        if (!userId) {
            res.sendStatus(HttpStatuses.Unauthorized)
            return;
        }

        const userObjectId = toObjectId(userId)

        if (!userObjectId) {
            res.sendStatus(HttpStatuses.Unauthorized)
            return;
        }

        const user = await usersQueryRepository.getUserById(userObjectId, UsersOutputMapEnum.AUTH)

        if (!user) {
            res.sendStatus(HttpStatuses.Unauthorized)
            return;
        }

        res.status(HttpStatuses.Success).send(user)

    })
