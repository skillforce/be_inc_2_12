import { Router } from 'express';
import {
  addPostBodyValidators,
  createCommentByPostIdValidators,
  deletePostValidators,
  getCommentByPostIdValidators,
  updatePostBodyValidators,
} from '../middlewares/postInputValidationMiddleware';
import { postController } from '../composition-root/posts-composition-root';

export const postRouter = Router({});

postRouter.get('/', postController.getPosts.bind(postController));

postRouter.get('/:id', postController.getPostById.bind(postController));

postRouter.get(
  '/:id/comments',
  getCommentByPostIdValidators,
  postController.getPostCommentsByPostId.bind(postController),
);

postRouter.post(
  '/:id/comments',
  createCommentByPostIdValidators,
  postController.createCommentByPostId.bind(postController),
);

postRouter.post('/', addPostBodyValidators, postController.createPostByBlogId.bind(postController));

postRouter.put('/:id', updatePostBodyValidators, postController.updatePost.bind(postController));

postRouter.delete('/:id', deletePostValidators, postController.deletePost.bind(postController));
