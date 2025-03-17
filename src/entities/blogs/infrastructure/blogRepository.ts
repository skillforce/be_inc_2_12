import { injectable } from 'inversify';
import { BlogDocument, BlogModel } from '../domain/Blogs.entity';

@injectable()
export class BlogRepository {
  constructor() {}
  async saveBlog(blogData: BlogDocument): Promise<void> {
    await blogData.save();
  }
  async findBlogById(id: string): Promise<BlogDocument | null> {
    return BlogModel.findOne({ _id: id });
  }
  async deleteBlog(blogToDelete: BlogDocument): Promise<void> {
    await blogToDelete.deleteOne();
  }
}
