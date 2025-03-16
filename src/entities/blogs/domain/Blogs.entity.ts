import { BlogDbModel } from '../types/types';
import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';

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
  createdAt: { type: String, default: Date.now.toString() },
  isMembership: { type: Boolean, required: true },
});

const blogMethods = {};
const blogStaticMethods = {};

BlogSchema.methods = blogMethods;
BlogSchema.statics = blogStaticMethods;

type BlogMethods = typeof blogMethods;
type BlogStaticMethods = typeof blogStaticMethods;

export type BlogDocument = HydratedDocument<BlogDbModel, BlogMethods>;
type BlogModel = Model<BlogDbModel, {}, BlogMethods> & BlogStaticMethods;

export const BlogModel = mongoose.model<BlogDbModel, BlogModel>('Blog', BlogSchema);
