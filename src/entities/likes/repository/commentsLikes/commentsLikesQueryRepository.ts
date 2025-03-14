import { injectable } from 'inversify';
import { CommentLikesInfoViewModel, LikeStatusEnum } from '../../types/types';
import { CommentLikeModel } from '../../domain/CommentLike.entity';

@injectable()
export class CommentsLikesQueryRepository {
  constructor() {}
  async getCommentLikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      CommentLikeModel.countDocuments({
        parentId: commentId,
        likeStatus: LikeStatusEnum.LIKE,
      }) || 0
    );
  }
  async getCommentDislikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      CommentLikeModel.countDocuments({
        parentId: commentId,
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
      parentId: commentId,
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
  async getBulkCommentLikesInfo({
    commentIds,
    userId,
  }: {
    commentIds: string[];
    userId?: string;
  }): Promise<Record<string, CommentLikesInfoViewModel>> {
    const pipeline = [
      {
        $match: {
          parentId: { $in: commentIds },
        },
      },
      {
        $group: {
          _id: '$parentId',
          likesCount: {
            $sum: {
              $cond: [{ $eq: ['$likeStatus', LikeStatusEnum.LIKE] }, 1, 0],
            },
          },
          dislikesCount: {
            $sum: {
              $cond: [{ $eq: ['$likeStatus', LikeStatusEnum.DISLIKE] }, 1, 0],
            },
          },
          myStatus: {
            $first: {
              $cond: [{ $eq: ['$userId', userId] }, '$likeStatus', null],
            },
          },
        },
      },
    ];

    const likesInfo = await CommentLikeModel.aggregate(pipeline);

    const result: Record<string, CommentLikesInfoViewModel> = {};

    commentIds.forEach((commentId) => {
      result[commentId] = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.NONE,
      };
    });

    likesInfo.forEach((info) => {
      result[info._id] = {
        likesCount: info.likesCount,
        dislikesCount: info.dislikesCount,
        myStatus: info.myStatus || LikeStatusEnum.NONE,
      };
    });

    return result;
  }
}
