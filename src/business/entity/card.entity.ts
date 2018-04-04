import { TagEntity } from './tag.entity';
import { FileEntity } from './file.entity';
import { CacheableEntity } from './cacheable-entity';

export class CardEntity implements CacheableEntity {
  id: number = -1;
  entityName = 'card';

  modificationDate: Date;

  private _title: string;

  set title(title: string) {
    if (this.modified === false && this._title !== title) {
      this.modified = true;
    }
    this._title = title;
  }

  get title(): string {
    return this._title;
  }

  private _content: string;

  set content(content: string) {
    if (this.modified === false && this._content !== content) {
      this.modified = true;
    }

    this._content = content;
  }

  get content(): string {
    return this._content;
  }


  tags: TagEntity[] = [];
  links: CardEntity[] = [];
  files: FileEntity[] = [];

  /**
   * Transient field that is used to store the modified state in case the card was changed and potentially
   * must be saved. This state automatically reflects changes of title and content. The other fields must
   * be monitored manually.
   */
  modified = false;
}
