import { NextFunction, Request, Response } from "express";
import { jwtService } from "../../../common/adapters/jwt.service";
import { usersRepository } from "../../../entities/users/repository/usersRepository";
import { toObjectId } from "../../../common/helpers";
import { IdType } from "../../../common/types/id";


export const accessTokenGuard = async (req: Request,
                                       res: Response,
                                       next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }

    const [authType, token] = req.headers.authorization.split(" ")[1];

    if (authType !== 'Bearer') {
        res.sendStatus(401);
        return
    }

    const payload = await jwtService.verifyToken(token);
    if (payload) {
        const {userId} = payload;

        const userObjectId = toObjectId(userId)

        if(!userObjectId) {
            res.sendStatus(401);
            return
        }

        const doesUserExist = await usersRepository.doesExistById(userObjectId);

        if (!doesUserExist) {
            res.sendStatus(401);
            return
        }

        req.user = {id: userId} as IdType;
        next();
        return
    }
      res.sendStatus(401);

}