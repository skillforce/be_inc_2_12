import {
    NextFunction,
    Request,
    Response
} from "express";
import { SETTINGS } from "../settings";

export const ADMIN_AUTH = SETTINGS.ADMIN_AUTH;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string

    if (!auth) {
        res
            .status(401)
            .json({})
        return
    }
    const buff = Buffer.from(auth.slice(6), 'base64')
    const decodedAuth = buff.toString('utf8')

    const buff2 = Buffer.from(ADMIN_AUTH, 'utf8')
    const codedAuth = buff2.toString('base64')

    if (auth.slice(6) !== codedAuth || auth.slice(0, 5) !== 'Basic ') {
        res
            .status(401)
            .json({})
        return
    }

    next()
}