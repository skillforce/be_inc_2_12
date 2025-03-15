import { Request, Response } from 'express';
import { PaginatedData } from '../../../common/types/pagination';
import { AddUpdateBlogRequiredInputData, BlogViewModel } from '../types/types';
import { BlogQueryRepository } from '../infrastructure/blogQueryRepository';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { toObjectId } from '../../../common/helpers/helper';
import { ObjectId } from 'mongodb';
import { UpdatePostDTO, PostViewModel } from '../../posts/types/types';
import { PostQueryRepository } from '../../posts/infrastructure/postQueryRepository';
import { BlogService } from '../service/blogService';
import { ResultStatus } from '../../../common/result/resultCode';
import { PostService } from '../../posts/service/postService';
import { inject } from 'inversify';

export class BlogsController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(BlogService) protected blogService: BlogService,
    @inject(PostQueryRepository) protected postQueryRepository: PostQueryRepository,
    @inject(BlogQueryRepository) protected blogQueryRepository: BlogQueryRepository,
  ) {}
  async getBlogs(req: Request, res: Response<PaginatedData<BlogViewModel[]>>) {
    const queryObj = req.query;

    const responseData = await this.blogQueryRepository.getPaginatedBlogs(
      queryObj as Record<string, string | undefined>,
    );
    res.status(HttpStatuses.Success).json(responseData);
  }
  async getBlogById(req: Request<{ id: string }>, res: Response<BlogViewModel>) {
    const _id = toObjectId(req.params.id);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const responseData = await this.blogQueryRepository.getBlogById(_id as ObjectId);

    if (responseData) {
      res.status(HttpStatuses.Success).json(responseData);
      return;
    }
    res.sendStatus(HttpStatuses.NotFound);
  }

  async getPostsByBlogId(
    req: Request<{ id: string }>,
    res: Response<PaginatedData<PostViewModel[]>>,
  ) {
    const queryObj = req.query;
    const id = req.params.id;

    const searchBlogId = { blogId: { $regex: id } };
    const filter = { ...searchBlogId };

    const responseData = await this.postQueryRepository.getPaginatedPosts(
      queryObj as Record<string, string | undefined>,
      filter,
    );

    res.status(HttpStatuses.Success).json(responseData);
  }
  async createBlog(
    req: Request<any, AddUpdateBlogRequiredInputData>,
    res: Response<BlogViewModel>,
  ) {
    const { name, websiteUrl, description } = req.body;
    const newBlogResult = await this.blogService.addBlog({ name, websiteUrl, description });

    if (newBlogResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    const blogById = await this.blogQueryRepository.getBlogById(newBlogResult.data as ObjectId);

    if (!blogById) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).json(blogById as BlogViewModel);
  }
  async addPostByBlogId(
    req: Request<
      {
        id: string;
      },
      Omit<UpdatePostDTO, 'blogId'>
    >,
    res: Response<PostViewModel>,
  ) {
    const blogId = req.params.id;
    const _id = toObjectId(blogId);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await this.blogQueryRepository.getBlogById(_id);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newPostResult = await this.postService.addPost(req.body, blogById);

    if (newPostResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }
    const createdPostForOutput = await this.postQueryRepository.getPostById(
      newPostResult.data as ObjectId,
    );

    if (!createdPostForOutput) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Created).json(createdPostForOutput);
  }
  async updateBlogById(
    req: Request<{ id: string }, AddUpdateBlogRequiredInputData>,
    res: Response<any>,
  ) {
    const queryIdForUpdate = req.params.id;
    const newDataForBlogToUpdate = req.body;

    const result = await this.blogService.updateBlog(queryIdForUpdate, newDataForBlogToUpdate);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
  async deleteBlogById(req: Request<{ id: string }>, res: Response<void>) {
    const queryId = req.params.id;
    const result = await this.blogService.deleteBlog(queryId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
}
