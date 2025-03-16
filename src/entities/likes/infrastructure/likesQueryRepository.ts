import { injectable } from 'inversify';
import { LikesInfoViewModel, LikeStatusEnum } from '../types/types';
import { LikeModel } from '../domain/Like.entity';

@injectable()
export class LikesQueryRepository {
  constructor() {}
  async getCommentLikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      LikeModel.countDocuments({
        parentId: commentId,
        likeStatus: LikeStatusEnum.LIKE,
      }) || 0
    );
  }
  async getCommentDislikesCount({ commentId }: { commentId: string }): Promise<number> {
    return (
      LikeModel.countDocuments({
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
    const likeData = await LikeModel.findOne({
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
  }): Promise<LikesInfoViewModel> {
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
  }): Promise<Record<string, LikesInfoViewModel>> {
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
          myStatuses: {
            $push: {
              $cond: [{ $eq: ['$userId', userId] }, '$likeStatus', null],
            },
          },
        },
      },
      {
        $project: {
          likesCount: 1,
          dislikesCount: 1,
          myStatus: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$myStatuses',
                  cond: { $ne: ['$$this', null] },
                },
              },
              0,
            ],
          },
        },
      },
    ];

    const likesInfo = await LikeModel.aggregate(pipeline);

    const result: Record<string, LikesInfoViewModel> = {};

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
