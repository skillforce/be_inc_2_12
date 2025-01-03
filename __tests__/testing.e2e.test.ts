import { req } from './test-helpers'
import { SETTINGS } from '../src/settings'
import { MongoMemoryServer } from "mongodb-memory-server";
import { blogCollection, connectToDB, postCollection } from "../src/db/mongo-db";

describe('/testing', () => {
        beforeAll(async () => {
            const dbServer = await MongoMemoryServer.create()
            const uri = dbServer.getUri();

            await connectToDB(uri)

        },10000)
    it('should return 204 status ', async () => {
        await req
            .delete(SETTINGS.PATH.TESTING+'/all-data')
            .expect(204)
        const postCollectionArray = await postCollection.find().toArray()
        const blogCollectionArray = await blogCollection.find().toArray()
        expect(postCollectionArray.length).toBe(0)
        expect(blogCollectionArray.length).toBe(0)

    })
})