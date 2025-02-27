import { Router } from 'express';
import {
  addBlogBodyValidators,
  deleteBlogValidators,
  updateBlogBodyValidators,
} from '../middlewares/blogInputValidationMiddleware';
import {
  createPostByBlogIdValidators,
  getPostsByBlogIdValidators,
} from '../../posts/middlewares/postInputValidationMiddleware';
import { blogController } from '../composition-root/blog-composition-root';

export const blogRouter = Router({});

blogRouter.get('/', blogController.getBlogs.bind(blogController));

blogRouter.get('/:id', blogController.getBlogById.bind(blogController));

blogRouter.get(
  '/:id/posts',
  getPostsByBlogIdValidators,
  blogController.getPostsByBlogId.bind(blogController),
);

blogRouter.post('/', addBlogBodyValidators, blogController.createBlog.bind(blogController));

blogRouter.post(
  '/:id/posts',
  createPostByBlogIdValidators,
  blogController.addPostByBlogId.bind(blogController),
);

blogRouter.put(
  '/:id',
  updateBlogBodyValidators,
  blogController.updateBlogById.bind(blogController),
);

blogRouter.delete('/:id', deleteBlogValidators, blogController.deleteBlogById.bind(blogController));
