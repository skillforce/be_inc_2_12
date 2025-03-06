import { BlogDbModel } from '../types/types';
import mongoose, { Schema } from 'mongoose';

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

export const BlogModel = mongoose.model<BlogDbModel>('Blog', BlogSchema);
