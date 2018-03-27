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

  /**
   * transient field that is used store the modified state in case the card was changed and potentially
   * must be saved
   */
  modified = false;

  // TODO store original values...
}
