import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  Index,
  ManyToOne
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Author } from './Author';
import { Post } from './Post';
import { portmanteau } from '../utils/portmanteau/portmanteau';
import { RelationColumn } from '../utils/relationColumn';

const lastElement = <T>(arr: T[]) => arr[arr.length - 1];

@ObjectType()
@Entity()
@Index(['author1Id', 'author2Id'], { unique: true })
export class Portman extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  portman: string;

  @Field(() => [Post], { nullable: true }) // posts could be deleted
  @OneToMany(() => Post, post => post.portman)
  posts: Post[];

  // impose arbitrary order author1 < author2, indeed author1 !== author2
  @Field(() => Author)
  @ManyToOne(() => Author, { nullable: false })
  author1: Author;
  @RelationColumn({ nullable: false })
  author1Id: number;

  @Field(() => Author)
  @ManyToOne(() => Author, { nullable: false })
  author2: Author;
  @RelationColumn({ nullable: false })
  author2Id: number;

  // Given two author IDs, check if a portman has already been gen'd for the combo
  // where author1 corresponds to the lesser ID.
  // If it has, return it. If not, gen it, save, return.
  static async findOrInsertPortman(id1: number, id2: number): Promise<Portman> {
    // make sure order is correct
    const author1Id = Math.min(id1, id2);
    const author2Id = Math.max(id1, id2);

    const existingPortman = await this.findOne({ author1Id, author2Id });

    if (existingPortman) {
      console.log('This Portman already exists.');
      return existingPortman;
    }

    // this should error out if the authors don't exist for both IDs
    const [author1, author2] = await Author.findByIds([author1Id, author2Id]);
    const author1LastName = lastElement(author1!.name.split(' ')).toLowerCase();
    const author2LastName = lastElement(author2!.name.split(' ')).toLowerCase();

    const newPortman = this.create({
      author1Id,
      author2Id,
      portman: portmanteau(author1LastName, author2LastName)
    });

    await this.insert(newPortman);
    console.log('Saved new Portman in DB.');

    return newPortman;
  }
}
