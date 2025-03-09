import { injectable } from 'inversify';
import { CommentLikeDBModel } from '../../types/types';
import { CommentLikeModel } from '../../Model/CommentLikeSchema';

@injectable()
export class CommentsLikesRepository {
  constructor() {}
  async updateLikeStatus({ likeStatus, commentId, userId }: CommentLikeDBModel): Promise<boolean> {
    try {
      const previousLikeStatus = await CommentLikeModel.findOne({
        commentId,
        userId,
      });

      if (!previousLikeStatus) {
        const newLike = new CommentLikeModel({
          commentId,
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
      await CommentLikeModel.deleteMany({ commentId });
      return true;
    } catch (e) {
      return false;
    }
  }
}
