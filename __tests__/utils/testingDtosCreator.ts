type RequireOnlyOne<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

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
export type PostDtoDto = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export const testingDtosCreator = {
  createUserDto({ login, email, pass }: Partial<UserDto>): UserDto {
    return {
      login: login ?? 'test',
      email: email ?? 'test@gmail.com',
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
  createBlogDtos(count: number): BlogDto[] {
    const blogs = [];

    for (let i = 0; i <= count; i++) {
      blogs.push({
        name: 'test' + i,
        websiteUrl: `test${i}@gmail.com`,
        description: '12345678',
      });
    }
    return blogs;
  },
  createPostDto({
    title,
    content,
    shortDescription,
    blogId,
  }: RequireOnlyOne<PostDtoDto, 'blogId'>): PostDtoDto {
    return {
      title: title ?? 'testPost',
      content: content ?? 'content',
      shortDescription: shortDescription ?? 'shortDescription',
      blogId: blogId,
    };
  },
};
