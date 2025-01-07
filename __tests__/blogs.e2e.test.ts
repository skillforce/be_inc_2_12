import { req } from './test-helpers'
import { SETTINGS } from '../src/settings'
import { AddUpdateBlogRequestRequiredData, BlogDBType } from "../src/entities/blogs/types/types";
import { MongoMemoryServer } from 'mongodb-memory-server'
import { blogCollection, connectToDB } from "../src/db/mongo-db";
import { blogService } from "../src/entities/blogs/domain/blogService";

describe('/blogs', () => {
    beforeAll(async () => {
        const dbServer = await MongoMemoryServer.create()
        const uri = dbServer.getUri();

        await connectToDB(uri)

    },10000)

    it('should get empty array', async () => {
        await blogCollection.deleteMany({})
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.items.length).toBe(0)
    })
    it('should get not empty array', async () => {
        const insertData = {
            name: 'Video Name',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
        }

    await blogService.addBlog(insertData as BlogDBType)

    const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.items.length).toBe(1)
    })
    it('should return error when try to get item with id that doesnt exist ', async () => {
            await req
            .get(SETTINGS.PATH.BLOGS+'/3')
            .expect(404)
    })
    it('should create blog object and return created one back to the client', async () => {
        const videoData:AddUpdateBlogRequestRequiredData = {
            name: 'Video Name',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
        };
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(videoData)
        expect(res.body).toMatchObject(videoData)
    })
    it('should create new post and apply blog id that has been sent', async () => {

        const blogFromDb = await blogCollection.find().toArray()
        const blogId = blogFromDb[0]._id

        const postData = {
            title: 'Video Name123',
            shortDescription: 'Video Description',
            content: 'Video Content',
        };

        const res = await req
            .post(SETTINGS.PATH.BLOGS+'/'+blogId+'/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(postData)
        expect(res.body).toMatchObject(postData)
    })
    it('should return post items with appropriate blog id', async () => {

        const blogFromDb = await blogCollection.find().toArray()
        const blogId = blogFromDb[0]._id

        const postData = {
            title: 'Video Name123',
            shortDescription: 'Video Description',
            content: 'Video Content',
        };

        const res = await req
            .get(SETTINGS.PATH.BLOGS+'/'+blogId+'/posts')

        expect(res.body.items[0]).toMatchObject(postData)
    })
    it('should update blog object and return 204 status to client', async () => {
        const blogCollectionArray = await blogCollection.find().toArray() as BlogDBType[]
        const idToUpdate = blogCollectionArray[0]._id
        const videoData = {
            name: 'Video Name123',
            websiteUrl: 'https://www.youtube.com',
            description: 'Video Description',
        };
      await req
            .put(`${SETTINGS.PATH.BLOGS}/${idToUpdate}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(videoData)
            .expect(204)
    })
    it('should return 400 when body properties is incorrect', async () => {
        const blogCollectionArray = await blogCollection.find().toArray() as BlogDBType[]
        const idToUpdate = blogCollectionArray[0]._id
        const videoData = {
            name: '',
            websiteUrl:true,
            description: 123,
        };
      const res = await req
          .put(`${SETTINGS.PATH.BLOGS}/${idToUpdate}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(videoData)
            .expect(400)

    })
    it('should remove video by id', async () => {
        const blogCollectionArray = await blogCollection.find().toArray() as BlogDBType[]
        const idToUpdate = blogCollectionArray[0]._id
      const res = await req
            .delete(`${SETTINGS.PATH.BLOGS}/${idToUpdate}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(204)

    })
    it('should return 404 status ', async () => {
       await req
            .delete(SETTINGS.PATH.BLOGS+'/1')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(404)

    })
})