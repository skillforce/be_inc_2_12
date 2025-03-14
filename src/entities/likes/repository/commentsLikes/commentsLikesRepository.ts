import { injectable } from 'inversify';
import { CommentLikeDBModel } from '../../types/types';
import { CommentLikeModel } from '../../domain/CommentLike.entity';

@injectable()
export class CommentsLikesRepository {
  constructor() {}
  async updateLikeStatus({ likeStatus, parentId, userId }: CommentLikeDBModel): Promise<boolean> {
    try {
      const previousLikeStatus = await CommentLikeModel.findOne({
        parentId,
        userId,
      });

      if (!previousLikeStatus) {
        const newLike = new CommentLikeModel({
          parentId,
          userId,
          likeStatus,
        });
        await newLike.save();
        return true;
      }

      if (previousLikeStatus.likeStatus === likeStatus) {
        return true;
      }

      previousLikeStatus.likeStatus = likeStatus;
      await previousLikeStatus.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteAllLikesByCommentId(commentId: string): Promise<boolean> {
    try {
      await CommentLikeModel.deleteMany({ parentId: commentId });
      return true;
    } catch (e) {
      return false;
    }
  }
  async deleteAllLikesByCommentsId(commentsId: string[]): Promise<boolean> {
    try {
      await CommentLikeModel.deleteMany({ parentId: { $in: commentsId } });
      return true;
    } catch (e) {
      return false;
    }
  }
}
