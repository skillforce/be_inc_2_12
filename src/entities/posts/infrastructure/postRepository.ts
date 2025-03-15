import { injectable } from 'inversify';
import { PostDocument, PostModel } from '../domain/Post.entity';

@injectable()
export class PostRepository {
  constructor() {}
  async savePost(postData: PostDocument): Promise<void> {
    await postData.save();
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return PostModel.findOne({ _id: id });
  }

  async deletePost(postData: PostDocument): Promise<void> {
    await postData.deleteOne();
  }
}
