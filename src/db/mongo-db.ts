import { Db, MongoClient, ObjectId } from 'mongodb';
import { PostDBModel } from '../entities/posts';
import { BlogDbModel } from '../entities/blogs';
import { UserDBModel } from '../entities/users';
import { AppConfig } from '../app_config';
import { CommentDBModel } from '../entities/comments';
import { AuthMetaDBModel } from '../application/auth/types/types';
import { TriggerAttemptsCollectionDBModel } from '../common/types/types';

export class DataBase {
  constructor(
    protected client: MongoClient,
    protected appConfig: AppConfig,
  ) {}
  getDbName(): Db {
    return this.client.db(this.appConfig.DB_NAME);
  }
  async run(url: string) {
    try {
      this.client = new MongoClient(url);
      await this.client.connect();
      await this.getDbName().command({ ping: 1 });
      console.log('Connected successfully to mongo server');
    } catch (e: unknown) {
      console.error("Can't connect to mongo server", e);
      await this.client.close();
    }
  }
  async stop() {
    await this.client.close();
    console.log('Connection successful closed');
  }
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
  }
  getCollections() {
    return {
      usersCollection: this.getDbName().collection<UserDBModel>(
        this.appConfig.USERS_COLLECTION_NAME,
      ),
      postCollection: this.getDbName().collection<PostDBModel>(this.appConfig.POST_COLLECTION_NAME),
      blogCollection: this.getDbName().collection<BlogDbModel>(this.appConfig.BLOG_COLLECTION_NAME),
      authMetaCollection: this.getDbName().collection<AuthMetaDBModel>(
        this.appConfig.AUTH_META_COLLECTION_NAME,
      ),
      triggerAttemptsCollection: this.getDbName().collection<TriggerAttemptsCollectionDBModel>(
        this.appConfig.TRIGGER_ATTEMPTS_COLLECTION,
      ),
      commentsCollection: this.getDbName().collection<CommentDBModel>(
        this.appConfig.COMMENTS_COLLECTION_NAME,
      ),
    };
  }
}
