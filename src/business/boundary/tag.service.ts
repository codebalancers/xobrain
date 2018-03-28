import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { TagEntity } from '../entity/tag.entity';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { ArrayUtils } from '../../util/array.utils';

interface TagLink {
  card_id: number,
  tag_id: number,
  modificationDate: Date
}

@Injectable()
export class TagService {
  constructor(private dbService: DatabaseService) {
  }

  public getTags(cardId: number): Observable<TagEntity[]> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('tag')
          .innerJoin('card_tag', 'card_tag.tag_id', 'tag.id')
          .where('card_tag.card_id', cardId)
      )
      .map((res: any[]) => {
        console.log(res);
        return res.map(r => this.mapTag(r));
      });
  }

  private mapTag(r: any): TagEntity {
    const t = new TagEntity();
    t.id = r.id;
    t.name = r.name;

    return t;
  }

  private createTags(tags: TagEntity[]): Observable<void> {
    const os: Observable<void>[] = tags.map(tag => {
      return Observable
        .fromPromise(
          this.dbService
            .getConnection('tag')
            .insert({ name: tag.name, modificationDate: new Date() })
            .returning('id')
        )
        .map(d => {
          tag.id = d[ 0 ];
          return null;
        });
    });

    if (os.length > 0) {
      return Observable.forkJoin(os).map(() => null);
    } else {
      return Observable.of(null);
    }
  }

  /**
   * Store/update the specified tags for the specified card.
   *
   * @param {CardEntity} card
   * @param {TagEntity[]} tags
   * @return {Observable<void>}
   */
  public updateTags(card: CardEntity, tags: TagEntity[]): Observable<void> {
    // -- ensure all tag entities are present
    const tagsToBeCreated = tags.filter(t => t.id < 1);

    return this
      .createTags(tagsToBeCreated)
      .flatMap(() => Observable.fromPromise(this.dbService.getConnection('card_tag').where('card_id', card.id)))
      .flatMap((existingTags: TagLink[]) => {
        /**
         * All existing links that are not included in the tags array have to be deleted.
         */
        const toBeDeleted: number[] = existingTags
          .filter(et => ArrayUtils.containsNot(tags, et, (a, b) => a.id === b.tag_id))
          .map(et => et.tag_id);

        /**
         * All links that do not exist have to be created.
         */
        const toBeCreated: number[] = tags
          .filter(t =>
            ArrayUtils.containsNot(existingTags, t, (a, b) => a.tag_id === b.id)
          )
          .map(t => t.id);

        const os: Observable<void>[] = [];

        if (toBeDeleted.length > 0) {
          os.push(this.deleteLinks(card.id, toBeDeleted));
        }

        if (toBeCreated.length > 0) {
          os.push(this.createLinks(card.id, toBeCreated));
        }

        if (os.length > 0) {
          return Observable.forkJoin(os).map(() => null);
        } else {
          return Observable.of(null);
        }
      });
  }

  public searchTags(searchValue: string): Observable<TagEntity[]> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('tag')
          .where('name', 'LIKE', '%' + searchValue + '%')
      )
      .map((res: any[]) => res.map(tag => new TagEntity(tag.name, tag.id)));
  }

  /**
   * Delete the specified links and also delete the tags if they are not referenced anymore from another card.
   *
   * @param {number} cardId card for which the links to the tags shall be deleted
   * @param {number[]} toBeDeleted list of tags id which the links shall be deleted
   * @return {Observable<void>}
   */
  private deleteLinks(cardId: number, toBeDeleted: number[]): Observable<void> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card_tag')
          .where('card_id', cardId).and.whereIn('tag_id', toBeDeleted)
          .del()
      )
      .flatMap(() => Observable.fromPromise(
        this.dbService.getConnection('tag')
          .leftJoin('card_tag', 'tag.id', 'card_tag.tag_id')
          .whereNull('card_tag.tag_id')
          .and.whereIn('tag.id', toBeDeleted)
      ))
      .flatMap((res: any[]) => Observable.fromPromise(
        this.dbService.getConnection('tag')
          .whereIn('id', res.map(r => r.id))
          .del()
      ));
  }

  private createLinks(cardId: number, toBeCreated: number[]): Observable<void> {
    const data = toBeCreated.map(tagId => {
      return { card_id: cardId, tag_id: tagId, modificationDate: new Date() };
    });

    return Observable.fromPromise(this.dbService
      .getConnection('card_tag')
      .insert(data));
  }
}
