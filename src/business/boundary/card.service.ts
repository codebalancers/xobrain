import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from '../control/database.service';
import { ArrayUtils } from '../../util/array.utils';
import { LangUtils } from '../../util/lang.utils';
import { TagEntity } from '../entity/tag.entity';
import { FileEntity } from '../entity/file.entity';

@Injectable()
export class CardService {

  constructor(private dbService: DatabaseService) {
  }

  public findParents(card: CardEntity): Observable<CardEntity[]> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card')
          .innerJoin('card_card', 'card_card.card1_id', 'card.id')
          .where('card_card.card2_id', card.id)
      )
      .flatMap((res: any[]) => {
        const os: Observable<CardEntity>[] = res.map(r => this.mapCard(r));

        if (os.length === 0) {
          return Observable.of([]);
        } else {
          return Observable.forkJoin(os);
        }
      });
  }

  public updateChildren(card: CardEntity): Observable<CardEntity> {
    if (card.id < 1) {
      return Observable.of(card);
    }

    return this
      .getLinks(card.id)
      .map(links => {
        card.links = links;
        return card;
      });
  }

  public getCard(id: number): Observable<CardEntity> {
    return Observable
      .fromPromise(this.dbService.getConnection('card').where('card.id', id))
      .flatMap(res => {
        const r = ArrayUtils.getFirstElement(res);
        return this.mapCard(r);
      });
  }

  public save(card: CardEntity): Observable<CardEntity> {
    console.log('save', card);

    if (card.id > 0) {
      // -- update
      return Observable
        .fromPromise(
          this.dbService
            .getConnection('card')
            .where('id', '=', card.id)
            .update({ title: card.title, content: card.content })
        )
        .map(d => this.updateReferences(card))
        .map(() => card);
    } else {
      // -- create
      return Observable
        .fromPromise(
          this.dbService
            .getConnection('card')
            .insert({ title: card.title, content: card.content, creationDate: new Date() })
            .returning('id')
        )
        .map(d => {
          // set auto-generated id
          card.id = d[ 0 ];

          // create link from parent
          if (LangUtils.isDefined(card.parent)) {
            this.createLink(card.parent, card);

            // update the parent card so it know about its child
            card.parent.links.push(card);
          }

          this.updateReferences(card);
        })
        .map(() => card);
    }
  }

  private updateReferences(card: CardEntity): void {
    if (LangUtils.isArray(card.links)) {
      this.updateLinks(card, card.links);
    }

    if (LangUtils.isArray(card.tags)) {
      this.updateTags(card, card.tags);
    }

    if (LangUtils.isArray(card.files)) {
      this.updateFiles(card, card.files);
    }
  }

  private createLink(from: CardEntity, to: CardEntity) {
    this.dbService
      .getConnection('card_card')
      .insert({ card1_id: from.id, card2_id: to.id, creationDate: new Date() })
      .then(d => console.log(d));
  }

  private updateLinks(from: CardEntity, to: CardEntity[]) {
    Observable
      .fromPromise(
        this.dbService
          .getConnection('card_card')
          .where('card1_id', from.id)
          .del()
      )
      .flatMap(d => {
        console.log(d);

        const data = to.map(ce => {
          return { card1_id: from.id, card2_id: ce.id, creationDate: new Date() };
        });

        if (data.length === 0) {
          return Observable.of(null);
        }

        return Observable.fromPromise(this.dbService
          .getConnection('card_card')
          .insert(data)
        );
      })
      .subscribe(d => console.log(d));
  }

  private updateTags(card: CardEntity, tags: TagEntity[]) {
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
          return { card_id: card.id, tag_id: tag.id, creationDate: new Date() };
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

  private createTag(tag: TagEntity): Observable<void> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('tag')
          .insert({ name: tag.name, creationDate: new Date() })
          .returning('id')
      )
      .map(d => {
        tag.id = d[ 0 ];
        return null;
      });
  }

  private updateFiles(card: CardEntity, files: FileEntity[]) {
    console.error('NOT YET IMPLEMENTED');
  }

  public getInitialCard(): Observable<CardEntity> {
    const p = this.dbService
      .getConnection()
      .from('card').limit(1);

    return Observable
      .fromPromise(p)
      .flatMap((res: any[]) => {
        const card = ArrayUtils.getFirstElement(res);

        if (LangUtils.isUndefined(card)) {
          console.log('getInitialCard', 'return fresh card');
          const c = new CardEntity();
          c.title = 'My first card';
          c.content = 'Write something...';

          return this.save(c);
        }

        console.log('getInitialCard', card);
        return this.mapCard(card, true);
      });
  }

  private getFiles(cardId: number): Observable<FileEntity[]> {
    console.error('NOT YET IMPLEMENTED');
    return Observable.of(null);
  }

  private getTags(cardId: number): Observable<TagEntity[]> {
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

  private countAllLinks(cardId: number): Observable<number> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card_card')
          .count('card1_id')
          .where('card1_id', cardId)
          .or.where('card2_id', cardId)
      )
      .map(res => {
        return res[ 0 ][ 'count(`card1_id`)' ];
      });
  }

  private getLinks(cardId: number): Observable<CardEntity[]> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card')
          .innerJoin('card_card', 'card_card.card2_id', 'card.id')
          .where('card_card.card1_id', cardId)
      )
      .flatMap((res: any[]) => {
        const os: Observable<CardEntity>[] = res.map(r => this.mapCard(r));

        if (os.length === 0) {
          return Observable.of([]);
        } else {
          return Observable.forkJoin(os);
        }
      });
  }

  /**
   *
   * @param card
   * @param {boolean} references set to true, if also referenced entities shall be loaded
   * @return {Observable<CardEntity>}
   */
  private mapCard(card: any, references = false): Observable<CardEntity> {
    const cardEntity = new CardEntity();
    cardEntity.id = card.id;
    cardEntity.title = card.title;
    cardEntity.content = card.content;

    if (references === false) {
      return Observable.of(cardEntity);
    }

    const filesO = this.getFiles(cardEntity.id).map(files => {
      cardEntity.files = files;
      return null;
    });
    const tagsO = this.getTags(cardEntity.id).map(tags => {
      cardEntity.tags = tags;
      return null;
    });
    const linksO = this.getLinks(cardEntity.id).map(links => {
      cardEntity.links = links;
      return null;
    });

    return Observable
      .forkJoin([ filesO, tagsO, linksO ])
      .map(res => cardEntity);
  }

  public branchCard(parentCard: CardEntity): Observable<CardEntity> {
    const c = new CardEntity();
    c.id = -1;
    c.content = '';
    c.title = '';

    // make sure the specified parent was persisted
    if (LangUtils.isDefined(parentCard.id)) {
      c.parent = parentCard;
    }

    return Observable.of(c);
  }

  public deleteCard(card: CardEntity): Observable<boolean> {
    return this
      .countAllLinks(card.id)
      .flatMap((links: number) => {
        if (links <= 1) {
          return this._deleteCard(card).map(() => true);
        } else {
          return Observable.of(false);
        }
      })
  }

  private _deleteCard(card: CardEntity): Observable<void> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('card_card')
          .where('card1_id', card.id).or
          .where('card2_id', card.id)
          .del()
      )
      .flatMap(res => {
        return Observable
          .fromPromise(
            this.dbService
              .getConnection('card')
              .where('id', card.id)
              .del()
          );
      })
  }
}
