import { injectable } from 'inversify';
import { LikeDocument, LikeModel } from '../domain/Like.entity';

@injectable()
export class LikesRepository {
  constructor() {}
  async findLikeByParentIdAndUserId(
    parentId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return LikeModel.findOne({ parentId, userId });
  }
  async saveLike(likeDocument: LikeDocument): Promise<void> {
    await likeDocument.save();
  }
  async deleteAllLikesByParentId(parentId: string): Promise<void> {
    await LikeModel.deleteMany({ parentId });
  }
  async deleteAllLikesByParentIds(parentIds: string[]): Promise<void> {
    await LikeModel.deleteMany({ parentId: { $in: parentIds } });
  }
}
