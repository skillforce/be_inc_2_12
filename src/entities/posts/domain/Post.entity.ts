import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import { AddPostDTO, PostDBModel, UpdatePostDTO } from '../types/types';
import dayjs from 'dayjs';

const PostSchema = new Schema<PostDBModel>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true, default: dayjs().toISOString() },
});

const postMethods = {
  async updatePostBody(updatePostDTO: UpdatePostDTO): Promise<void> {
    const post = this as unknown as PostDocument;
    post.title = updatePostDTO.title;
    post.shortDescription = updatePostDTO.shortDescription;
    post.content = updatePostDTO.content;

    await post.save();
  },
};
const postStaticMethods = {
  createPost(postDto: AddPostDTO) {
    const newPost = new PostModel(postDto) as unknown as PostDocument;

    newPost.title = postDto.title;
    newPost.shortDescription = postDto.shortDescription;
    newPost.content = postDto.content;
    newPost.blogId = postDto.blogId;
    newPost.blogName = postDto.blogName;
    return newPost;
  },
};

PostSchema.methods = postMethods;
PostSchema.statics = postStaticMethods;

type PostMethods = typeof postMethods;
type PostStaticMethods = typeof postStaticMethods;

export type PostDocument = HydratedDocument<PostDBModel, PostMethods>;
type PostModel = Model<PostDBModel, {}, PostMethods> & PostStaticMethods;

export const PostModel = mongoose.model<PostDBModel, PostModel>('Post', PostSchema);
