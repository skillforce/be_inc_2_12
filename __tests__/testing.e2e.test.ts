import {req} from './test-helpers'
import {SETTINGS} from '../src/settings'
import { db, setDB } from "../src/db/db";
import { dataset1 } from "./datasets";

describe('/testing', () => {
    beforeAll(async () => {
        setDB()
    })
    it('should return 204 status ', async () => {
        setDB(dataset1)
        await req
            .delete(SETTINGS.PATH.TESTING+'/all-data')
            .expect(204)
        expect(db.videos.length).toBe(0)

    })
})