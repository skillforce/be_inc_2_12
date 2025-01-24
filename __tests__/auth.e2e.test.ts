import { req } from './test-helpers'
import { SETTINGS } from '../src/settings'
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToDB, usersCollection } from "../src/db/mongo-db";
import { AddUserInputQueryRequiredData } from "../src/entities/users/types/types";

const newUser = {
    email: 'testo@gmail.com',
    login: 'test123',
    password: 'Password1!'
} as AddUserInputQueryRequiredData



describe('/login', () => {
    beforeAll(async () => {
        const dbServer = await MongoMemoryServer.create()
        const uri = dbServer.getUri();

        await connectToDB(uri)
        await usersCollection.deleteMany({})
    },10000)

    it('should return error code 400 if there is incorrect login request body', async () => {
        await req
            .post(SETTINGS.PATH.AUTH)
            .send({
                loginOrEmail:undefined,
                password: undefined
            })
            .expect(400)

    })
    it('should return 204 status code when there are correct loginOrEmail and password', async () => {
       await req.post(SETTINGS.PATH.USERS)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newUser)
            .expect(201)

        await req
            .post(SETTINGS.PATH.AUTH)
            .send({
                loginOrEmail:newUser.login,
                password: newUser.password
            })
            .expect(204)

    })
    it('should return 401 status code when there are incorrect loginOrEmail or password', async () => {
        await req
            .post(SETTINGS.PATH.AUTH)
            .send({
                loginOrEmail:newUser.login,
                password: 'assasas'
            })
            .expect(401)

    })


})