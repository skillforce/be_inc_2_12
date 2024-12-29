import {req} from './test-helpers'
import {SETTINGS} from '../src/settings'
import { setDB } from "../src/db/db";
import { dataset1 } from "./datasets";
import { AddUpdateBlogRequestRequiredData } from "../src/blogs/types/types";

describe('/blogs', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        setDB()
    })

    it('should get empty array', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toBe(0)
    })
    it('should get not empty array', async () => {
        setDB(dataset1)
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)


        expect(res.body.length).toBe(1)
        expect(res.body[0]).toEqual(dataset1.blogs[0])
    })
    it('should return video with id 1 ', async () => {
        setDB(dataset1)
        const res = await req
            .get(SETTINGS.PATH.BLOGS+'/1')
            .expect(200)

        expect(res.body).toEqual(dataset1.blogs[0])
    })
    it('should return error when try to get item with id that doesnt exist ', async () => {
        setDB(dataset1)
        const res = await req
            .get(SETTINGS.PATH.BLOGS+'/3')
            .expect(404)
    })
    it('should create video object and return created one back to client', async () => {
        const videoData:AddUpdateBlogRequestRequiredData = {
            name: 'Video Name',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
        };
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(videoData)

        expect(res.body).toMatchObject(videoData)
    })
    it('should return error 404 when there are unexpected fields', async () => {
        const videoData:AddUpdateBlogRequestRequiredData & {unexpectedField: string} = {
            name: 'Video Name',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
            unexpectedField: 'Unexpected field',
        };
      await req
            .post(SETTINGS.PATH.BLOGS)
            .send(videoData)
            .expect(400)
    })
    it('should update video object and return 204 status to client', async () => {
        setDB(dataset1)
        const videoData = {
            name: 'Video Name123',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
        };
      await req
            .put(SETTINGS.PATH.BLOGS+'/1')
            .send(videoData)
            .expect(204)
    })
    it('should return 404 when there are unexpected fields', async () => {
        setDB(dataset1)
        const videoData:AddUpdateBlogRequestRequiredData & {unexpectedField: string} = {
            name: 'Video Name',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
            unexpectedField: 'Unexpected field',
        };
      const res = await req
            .put(SETTINGS.PATH.BLOGS+'/1')
            .send(videoData)
            .expect(400)

        console.log(res.body)
    })
    it('should return 400 when body properties is incorrect', async () => {
        setDB(dataset1)
        const videoData = {
            name: '',
            websiteUrl:true,
            description: 123,
        };
      const res = await req
            .put(SETTINGS.PATH.BLOGS+'/1')
            .send(videoData)
            .expect(400)

        console.log(res.body)
    })
    it('should remove video by id', async () => {
        setDB(dataset1)
      const res = await req
            .delete(SETTINGS.PATH.BLOGS+'/1')
            .expect(204)

    })
    it('should return 404 status ', async () => {
       await req
            .delete(SETTINGS.PATH.BLOGS+'/1')
            .expect(404)

    })
})