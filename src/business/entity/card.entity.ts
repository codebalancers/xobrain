import { TagEntity } from './tag.entity';
import { FileEntity } from './file.entity';

export class CardEntity {
  id: number;

  creationDate: Date;

  title: string;

  content: string;

  // tags: TagEntity[];
  // links: CardEntity[];
  // files: FileEntity[];
}
