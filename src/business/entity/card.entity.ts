import { TagEntity } from './tag.entity';
import { FileEntity } from './file.entity';

export class CardEntity {
  id: number;
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

  // /**
  //  * transient field, just to remember the information which card was used to branch to
  //  * this card on creation of a new card
  //  */
  // parent: CardEntity;

  /**
   * Transient field that is used to store the modified state in case the card was changed and potentially
   * must be saved. This state automatically reflects changes of title and content. The other fields must
   * be monitored manually.
   */
  modified = false;
}
