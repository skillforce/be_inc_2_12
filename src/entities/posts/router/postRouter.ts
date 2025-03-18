import { Router } from 'express';
import {
  addPostBodyValidators,
  createCommentByPostIdValidators,
  deletePostValidators,
  getCommentByPostIdValidators,
  getPostByIdValidators,
  getPostsByIdValidators,
  updatePostBodyValidators,
  updatePostLikeStatusValidators,
} from '../middlewares/postInputValidationMiddleware';
import { postController } from '../composition-root/posts-composition-root';

export const postRouter = Router({});

postRouter.get('/', getPostsByIdValidators, postController.getPosts.bind(postController));

postRouter.get('/:id', getPostByIdValidators, postController.getPostById.bind(postController));

postRouter.get(
  '/:id/comments',
  getCommentByPostIdValidators,
  postController.getPostCommentsByPostId.bind(postController),
);

postRouter.put(
  '/:id/like-status',
  updatePostLikeStatusValidators,
  postController.updatePostLikeStatus.bind(postController),
);

postRouter.post(
  '/:id/comments',
  createCommentByPostIdValidators,
  postController.createCommentByPostId.bind(postController),
);

postRouter.post('/', addPostBodyValidators, postController.createPostByBlogId.bind(postController));

postRouter.put('/:id', updatePostBodyValidators, postController.updatePost.bind(postController));

postRouter.delete('/:id', deletePostValidators, postController.deletePost.bind(postController));
