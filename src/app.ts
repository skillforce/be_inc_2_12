import express from 'express'
import cors from 'cors'
import { testingRouter } from "./entities/testing/router/testingRouter";
import { blogRouter } from "./entities/blogs";
import { postRouter } from "./entities/posts";
import { usersRouter } from "./entities/users";
import { authRouter } from "./entities/auth";
import { PATHS } from "./common/paths/paths";



export const initApp = ()=>{
    const app = express()

    app.use(express.json())
    app.use(cors())

    app.use(PATHS.AUTH.COMMON, authRouter)
    app.use(PATHS.BLOGS, blogRouter)
    app.use(PATHS.POSTS, postRouter)
    app.use(PATHS.USERS, usersRouter)
    app.use(PATHS.TESTING, testingRouter)

    app.get('/', (req, res) => {
        res.status(200).json({version: '1.1'})
    })


    return app
}