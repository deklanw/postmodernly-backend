import { Repository } from 'typeorm';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Post } from '../../entities/Post';
import { UserPostLike } from '../../entities/UserPostLike';
import { UserPostLikeInput } from './UserPostLikeInput';

@Service()
export class UserPostLikeService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(UserPostLike)
    private readonly userPostLikeRepo: Repository<UserPostLike>
  ) {}

  async likePost({ postId, like }: UserPostLikeInput, userId: number) {
    const post = await this.postRepo.findOne({ id: postId });
    const { creatorId } = post!;

    if (creatorId === userId) {
      // can't like own post
      console.log('Cannot like own Post');
      return false;
    }

    if (like) {
      const upl = this.userPostLikeRepo.create({ userId, postId });

      // like may already exist
      await this.userPostLikeRepo.save(upl);
      console.log('Created Like');
    } else {
      await this.userPostLikeRepo.delete({ userId, postId });
      console.log('Deleted Like');
    }
    return true;
  }
}
