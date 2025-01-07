import express from 'express'
import cors from 'cors'
import { SETTINGS } from "./settings";
import { testingRouter } from "./entities/testing/router/testingRouter";
import { blogRouter } from "./entities/blogs";
import { postRouter } from "./entities/posts";

export const app = express()
app.use(express.json())
app.use(cors())

app.use(SETTINGS.PATH.BLOGS, blogRouter)
app.use(SETTINGS.PATH.POSTS, postRouter)
app.use(SETTINGS.PATH.TESTING, testingRouter)

app.get('/', (req, res) => {
    res.status(200).json({version: '1.0'})
})
