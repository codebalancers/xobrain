import { TagEntity } from './tag.entity';
import { FileEntity } from './file.entity';

export class CardEntity {
  id: number;
  modificationDate: Date;
  title: string;
  content: string;
  tags: TagEntity[] = [];
  links: CardEntity[] = [];
  files: FileEntity[] = [];

  /**
   * transient field, just to remember the information which card was used to branch to
   * this card on creation of a new card
   */
  parent: CardEntity;
}
