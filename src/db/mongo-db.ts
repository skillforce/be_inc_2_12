import { Db, MongoClient } from "mongodb";
import { PostDBType } from "../entities/posts";
import { BlogDBType } from "../entities/blogs";
import { UserDBType } from "../entities/users";
import { APP_CONFIG } from "../settings";
import { CommentDBType } from "../entities/comments";


export const db = {
    client: {} as MongoClient,
    getDbName(): Db {
        return this.client.db(APP_CONFIG.DB_NAME);
    },
    async run(url: string) {
        try {
            this.client = new MongoClient(url)
            await this.client.connect();
            await this.getDbName().command({ping: 1});
            console.log("Connected successfully to mongo server");
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await this.client.close();
        }

    },
    async stop() {
        await this.client.close();
        console.log("Connection successful closed");
    },
    async drop() {
        try {
            //await this.getDbName().dropDatabase()
            const collections = await this.getDbName().listCollections().toArray();

            for (const collection of collections) {
                const collectionName = collection.name;
                await this.getDbName().collection(collectionName).deleteMany({});
            }
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    },
    getCollections() {
        return {
            usersCollection: this.getDbName().collection<UserDBType>(APP_CONFIG.USERS_COLLECTION_NAME),
            postCollection: this.getDbName().collection<PostDBType>(APP_CONFIG.POST_COLLECTION_NAME),
            blogCollection: this.getDbName().collection<BlogDBType>(APP_CONFIG.BLOG_COLLECTION_NAME),
            commentsCollection: this.getDbName().collection<CommentDBType>(APP_CONFIG.COMMENTS_COLLECTION_NAME)
        }
    }

}

// export const usersCollection = db.client?.? db.getDbName().collection<UserDBType>(APP_CONFIG.USERS_COLLECTION_NAME):{};
// export const postCollection = db.client?.db? db.getDbName().collection<PostDBType>(APP_CONFIG.POST_COLLECTION_NAME):{};
// export const blogCollection = db.client?.db? db.getDbName().collection<BlogDBType>(APP_CONFIG.BLOG_COLLECTION_NAME):{};


