import { RequireOnlyOne } from '../../src/common/types/types';

export type UserDto = {
  login: string;
  email: string;
  pass: string;
};

export type BlogDto = {
  name: string;
  websiteUrl: string;
  description: string;
};

export type PostDto = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type CommentDto = {
  content: string;
};

export const testingDtosCreator = {
  createUserDto({ login, email, pass }: Partial<UserDto>): UserDto {
    return {
      login: login ?? 'test' + Date.now().toString().slice(-3),
      email: email ?? 'test' + Date.now().toString().slice(-3) + '@gmail.com',
      pass: pass ?? '123456789',
    };
  },
  createUserDtos(count: number): UserDto[] {
    const users = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        pass: '12345678',
      });
    }
    return users;
  },
  createBlogDto({ websiteUrl, name, description }: Partial<BlogDto>): BlogDto {
    return {
      name: name ?? 'testBlog',
      description: description ?? 'description',
      websiteUrl: websiteUrl ?? 'https://test.com',
    };
  },
  createCommentDto(newCommentDto?: CommentDto): CommentDto {
    return {
      content: newCommentDto?.content ?? 'contentContentContentContent',
    };
  },
  createPostDto({
    title,
    content,
    shortDescription,
    blogId,
  }: RequireOnlyOne<PostDto, 'blogId'>): PostDto {
    return {
      title: title ?? 'testPost',
      content: content ?? 'content',
      shortDescription: shortDescription ?? 'shortDescription',
      blogId: blogId,
    };
  },
};
