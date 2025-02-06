import { Request, Response, Router } from 'express';
import { AddUpdateBlogRequiredInputData, BlogViewModel } from '../types/types';
import {
  addBlogBodyValidators,
  deleteBlogValidators,
  updateBlogBodyValidators,
} from '../middlewares/blogInputValidationMiddleware';
import { blogService } from '../service/blogService';
import {
  createPostByBlogIdValidators,
  getPostsByBlogIdValidators,
} from '../../posts/middlewares/postInputValidationMiddleware';
import { AddUpdatePostRequiredInputData, PostViewModel } from '../../posts/types/types';
import { postService } from '../../posts/service/postService';
import { blogQueryRepository } from '../repository/blogQueryRepository';
import { ObjectId } from 'mongodb';
import { postQueryRepository } from '../../posts/repository/postQueryRepository';
import { PaginatedData } from '../../../common/types/pagination';
import { toObjectId } from '../../../common/helpers/helper';
import { ResultStatus } from '../../../common/result/resultCode';
import { HttpStatuses } from '../../../common/types/httpStatuses';

export const blogRouter = Router({});

blogRouter.get('/', async (req: Request, res: Response<PaginatedData<BlogViewModel[]>>) => {
  const queryObj = req.query;

  const responseData = await blogQueryRepository.getPaginatedBlogs(
    queryObj as Record<string, string | undefined>,
  );
  res.status(HttpStatuses.Success).json(responseData);
});

blogRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<BlogViewModel>) => {
  const _id = toObjectId(req.params.id);

  if (!_id) {
    res.sendStatus(HttpStatuses.NotFound);
    return;
  }

  const responseData = await blogQueryRepository.getBlogById(_id as ObjectId);

  if (responseData) {
    res.status(HttpStatuses.Success).json(responseData);
    return;
  }
  res.sendStatus(HttpStatuses.NotFound);
});

blogRouter.get(
  '/:id/posts',
  getPostsByBlogIdValidators,
  async (req: Request<{ id: string }>, res: Response<PaginatedData<PostViewModel[]>>) => {
    const queryObj = req.query;
    const id = req.params.id;

    const searchBlogId = { blogId: { $regex: id } };
    const filter = { ...searchBlogId };

    const responseData = await postQueryRepository.getPaginatedPosts(
      queryObj as Record<string, string | undefined>,
      filter,
    );

    res.status(HttpStatuses.Success).json(responseData);
  },
);

blogRouter.post(
  '/',
  addBlogBodyValidators,
  async (req: Request<any, AddUpdateBlogRequiredInputData>, res: Response<BlogViewModel>) => {
    const { name, websiteUrl, description } = req.body;
    const newBlogResult = await blogService.addBlog({ name, websiteUrl, description });

    if (newBlogResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    const blogById = await blogQueryRepository.getBlogById(newBlogResult.data as ObjectId);

    if (!blogById) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).json(blogById as BlogViewModel);
  },
);

blogRouter.post(
  '/:id/posts',
  createPostByBlogIdValidators,
  async (
    req: Request<
      {
        id: string;
      },
      Omit<AddUpdatePostRequiredInputData, 'blogId'>
    >,
    res: Response<PostViewModel>,
  ) => {
    const blogId = req.params.id;
    const _id = toObjectId(blogId);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await blogQueryRepository.getBlogById(_id);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newPostResult = await postService.addPost(req.body, blogById);

    if (newPostResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }
    const createdPostForOutput = await postQueryRepository.getPostById(
      newPostResult.data as ObjectId,
    );

    if (!createdPostForOutput) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Created).json(createdPostForOutput);
  },
);

blogRouter.put(
  '/:id',
  updateBlogBodyValidators,
  async (req: Request<{ id: string }, AddUpdateBlogRequiredInputData>, res: Response<any>) => {
    const queryIdForUpdate = req.params.id;
    const newDataForBlogToUpdate = req.body;

    const result = await blogService.updateBlog(queryIdForUpdate, newDataForBlogToUpdate);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);

blogRouter.delete(
  '/:id',
  deleteBlogValidators,
  async (req: Request<{ id: string }>, res: Response<void>) => {
    const queryId = req.params.id;
    const result = await blogService.deleteBlog(queryId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);
