import { AddBlogDto, AddUpdateBlogRequiredInputData, BlogDbModel } from '../types/types';
import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import dayjs from 'dayjs';

const BlogSchema = new Schema<BlogDbModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  createdAt: { type: String, default: dayjs().toISOString() },
  isMembership: { type: Boolean, required: true },
});

const blogMethods = {
  async updateBlogBody(updateBlogDTO: AddUpdateBlogRequiredInputData): Promise<void> {
    const blog = this as unknown as BlogDocument;
    blog.name = updateBlogDTO.name;
    blog.description = updateBlogDTO.description;
    blog.websiteUrl = updateBlogDTO.websiteUrl;

    await blog.save();
  },
};
const blogStaticMethods = {
  createBlog(blogDTO: AddBlogDto) {
    const newBlog = new BlogModel(blogDTO) as unknown as BlogDocument;

    newBlog.name = blogDTO.name;
    newBlog.description = blogDTO.description;
    newBlog.websiteUrl = blogDTO.websiteUrl;
    newBlog.isMembership = blogDTO.isMembership;

    return newBlog;
  },
};

BlogSchema.methods = blogMethods;
BlogSchema.statics = blogStaticMethods;

type BlogMethods = typeof blogMethods;
type BlogStaticMethods = typeof blogStaticMethods;

export type BlogDocument = HydratedDocument<BlogDbModel, BlogMethods>;
type BlogModel = Model<BlogDbModel, {}, BlogMethods> & BlogStaticMethods;

export const BlogModel = mongoose.model<BlogDbModel, BlogModel>('Blog', BlogSchema);
