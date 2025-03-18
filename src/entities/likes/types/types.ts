export enum LikeStatusEnum {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}
export interface LikeDBModel {
  userId: string;
  parentId: string;
  likeStatus: LikeStatusEnum;
  createdAt: string;
}

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}
export interface NewestLike {
  addedAt: string;
  userId: string;
  login: string;
}

export interface ExtendedLikesInfoViewModel extends LikesInfoViewModel {
  newestLikes: NewestLike[];
}
