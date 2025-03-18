import { injectable } from 'inversify';
import { LikesInfoViewModel, LikeStatusEnum, NewestLike } from '../types/types';
import { LikeModel } from '../domain/Like.entity';
import { UserModel } from '../../users';
import { PipelineStage } from 'mongoose';
import dayjs from 'dayjs';

@injectable()
export class LikesQueryRepository {
  constructor() {}
  async getEntityLikesCount({ parentId }: { parentId: string }): Promise<number> {
    return (
      LikeModel.countDocuments({
        parentId,
        likeStatus: LikeStatusEnum.LIKE,
      }) || 0
    );
  }
  async getEntityDislikesCount({ parentId }: { parentId: string }): Promise<number> {
    return (
      LikeModel.countDocuments({
        parentId,
        likeStatus: LikeStatusEnum.DISLIKE,
      }) || 0
    );
  }
  async getUserLikeStatusForEntity({
    parentId,
    userId,
  }: {
    parentId: string;
    userId: string;
  }): Promise<LikeStatusEnum> {
    const likeData = await LikeModel.findOne({
      parentId,
      userId,
    });
    if (likeData) {
      return likeData.likeStatus;
    }
    return LikeStatusEnum.NONE;
  }
  async getEntityLikesInfo({
    parentId,
    userId,
  }: {
    parentId: string;
    userId?: string;
  }): Promise<LikesInfoViewModel> {
    const likesCount = await this.getEntityLikesCount({ parentId });
    const dislikesCount = await this.getEntityDislikesCount({ parentId });
    const likeStatus = userId
      ? await this.getUserLikeStatusForEntity({ parentId, userId })
      : LikeStatusEnum.NONE;
    return {
      likesCount: Number(likesCount),
      dislikesCount: Number(dislikesCount),
      myStatus: likeStatus,
    };
  }
  async getBulkLikesInfo({
    parentIds,
    userId,
  }: {
    parentIds: string[];
    userId?: string;
  }): Promise<Record<string, LikesInfoViewModel>> {
    const pipeline = [
      {
        $match: {
          parentId: { $in: parentIds },
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

    parentIds.forEach((commentId) => {
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

  async getNewestLikesForParentId(parentId: string): Promise<NewestLike[]> {
    const lastLikes = await LikeModel.find({ parentId, likeStatus: LikeStatusEnum.LIKE })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const userIds = lastLikes.map((like) => like.userId);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('login')
      .lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user.login]));

    return lastLikes.map((like) => ({
      addedAt: like.createdAt,
      userId: like.userId,
      login: userMap.get(like.userId) || 'Unknown User',
    }));
  }

  async getBulkNewestLikesForParentIds(parentIds: string[]): Promise<Record<string, NewestLike[]>> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          parentId: { $in: parentIds },
          likeStatus: { $in: [LikeStatusEnum.LIKE] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$parentId',
          likes: {
            $push: {
              userId: '$userId',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          likes: { $slice: ['$likes', 3] },
        },
      },
    ];

    const results = await LikeModel.aggregate(pipeline);
    const userIds = results.flatMap((result) =>
      result.likes.map((like: { userId: string }) => like.userId),
    );
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('login')
      .lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user.login]));

    const resultMap: Record<string, NewestLike[]> = {};
    results.forEach((result) => {
      resultMap[result._id] = result.likes.map((like: { userId: string; createdAt: Date }) => ({
        addedAt: dayjs(like.createdAt).toISOString(),
        userId: like.userId,
        login: userMap.get(like.userId) || 'Unknown User',
      }));
    });

    // Fill in empty arrays for parentIds that had no likes
    parentIds.forEach((id) => {
      if (!resultMap[id]) {
        resultMap[id] = [];
      }
    });

    return resultMap;
  }
}
