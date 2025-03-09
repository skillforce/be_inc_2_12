export enum LikeStatusEnum {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}
export interface CommentLikeDBModel {
  userId: string;
  commentId: string;
  likeStatus: LikeStatusEnum;
}

export interface CommentLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}
