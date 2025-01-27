import { initApp } from './app'
import { APP_CONFIG } from "./settings";
import { db } from "./db/mongo-db";


export const app = initApp()
app.get('/', (req, res) => {
    res.status(200).json({version: '1.0'})
})


const startServer = async () => {
    await db.run(APP_CONFIG.MONGO_URL)

    app.listen(APP_CONFIG.PORT, () => {
        console.log('app started on port ' + APP_CONFIG.PORT)
    })
}

startServer()


