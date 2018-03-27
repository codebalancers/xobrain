import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { TagEntity } from '../entity/tag.entity';
import { Observable } from 'rxjs/Observable';
import { LangUtils } from '../../util/lang.utils';
import { CardEntity } from '../entity/card.entity';

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

  private createTag(tag: TagEntity): Observable<void> {
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
  }

  public updateTags(card: CardEntity, tags: TagEntity[]) {
    // -- ensure all tag entities are present
    const queries = tags
      .filter(t => LangUtils.isUndefined(t.id))
      .map(t => this.createTag(t));

    // -- delete all old connections for the specified card
    queries.push(
      Observable.fromPromise(this.dbService
        .getConnection('card_tag')
        .where('card_id', card.id)
        .del())
    );

    Observable
      .forkJoin(queries)
      .flatMap(r => {
        console.log(r);

        // -- create new links between card and tags
        const data = tags.map(tag => {
          return { card_id: card.id, tag_id: tag.id, modificationDate: new Date() };
        });

        if (data.length === 0) {
          return Observable.of(null);
        }

        return Observable.fromPromise(this.dbService
          .getConnection('card_tag')
          .insert(data));
      })
      .subscribe(r => console.log(r));
  }
}
