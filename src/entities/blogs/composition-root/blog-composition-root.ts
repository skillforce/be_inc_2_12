import { BlogsController } from '../controller/blogsController';
import { BlogQueryRepository } from '../repository/blogQueryRepository';
import { PostService } from '../../posts/service/postService';
import { BlogService } from '../service/blogService';
import { PostQueryRepository } from '../../posts/repository/postQueryRepository';
import { PostRepository } from '../../posts/repository/postRepository';
import { BlogRepository } from '../repository/blogRepository';
import { db } from '../../../db/composition-root';
import { Container } from 'inversify';
import { DataBase } from '../../../db/mongo-db';

const container = new Container();

container.bind(DataBase).toConstantValue(db);
container.bind(PostQueryRepository).to(PostQueryRepository);
container.bind(PostRepository).to(PostRepository);
container.bind(BlogQueryRepository).to(BlogQueryRepository);
container.bind(BlogRepository).to(BlogRepository);
container.bind(PostService).to(PostService);
container.bind(BlogService).to(BlogService);
container.bind(BlogsController).to(BlogsController);

export const blogController = container.get(BlogsController);
