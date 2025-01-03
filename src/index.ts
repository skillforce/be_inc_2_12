import {app} from './app'
import {SETTINGS} from './settings'
import { connectToDB } from "./db/mongo-db";


const startServer = async () => {

    if(!await connectToDB(SETTINGS.MONGO_URL)){
        console.log('not connected to db')
        process.exit(1)
    }

    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    })
}

startServer()


