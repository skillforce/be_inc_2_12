export enum LikeStatusEnum {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}
export interface LikeDBModel {
  userId: string;
  parentId: string;
  likeStatus: LikeStatusEnum;
}

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}
