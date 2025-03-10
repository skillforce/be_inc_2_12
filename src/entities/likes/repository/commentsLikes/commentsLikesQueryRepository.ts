import { injectable } from 'inversify';
import { CommentLikesInfoViewModel, LikeStatusEnum } from '../../types/types';
import { CommentLikeModel } from '../../domain/CommentLike.entity';

@injectable()
export class CommentsLikesQueryRepository {
  constructor() {}
  async getCommentLikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      CommentLikeModel.countDocuments({
        commentId,
        likeStatus: LikeStatusEnum.LIKE,
      }) || 0
    );
  }
  async getCommentDislikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      CommentLikeModel.countDocuments({
        commentId,
        likeStatus: LikeStatusEnum.DISLIKE,
      }) || 0
    );
  }
  async getUserLikeStatusForComment({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<LikeStatusEnum> {
    const likeData = await CommentLikeModel.findOne({
      commentId,
      userId,
    });
    if (likeData) {
      return likeData.likeStatus;
    }
    return LikeStatusEnum.NONE;
  }
  async getCommentLikesInfo({
    commentId,
    userId,
  }: {
    commentId: string;
    userId?: string;
  }): Promise<CommentLikesInfoViewModel> {
    const likesCount = await this.getCommentLikesCount({ commentId });
    const dislikesCount = await this.getCommentDislikesCount({ commentId });
    const likeStatus = userId
      ? await this.getUserLikeStatusForComment({ commentId, userId })
      : LikeStatusEnum.NONE;
    return {
      likesCount: Number(likesCount),
      dislikesCount: Number(dislikesCount),
      myStatus: likeStatus,
    };
  }
}
