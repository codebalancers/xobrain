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

  public getCard(id: number): Observable<CardEntity> {
    return Observable
      .fromPromise(this.dbService.getConnection('card').where('card.id', id))
      .flatMap(res => {
        const r = ArrayUtils.getFirstElement(res);
        return this.mapCard(r);
      });
  }

  public save(card: CardEntity): void {
    console.log('save', card);

    if (card.id) {
      // -- update
      this.dbService
        .getConnection('card')
        .where('id', '=', card.id)
        .update({title: card.title, content: card.content})
        .then(d => console.log(d));

      this.updateReferences(card);
    } else {
      // -- create
      this.dbService
        .getConnection('card')
        .insert({title: card.title, content: card.content, creationDate: new Date()})
        .returning('id')
        .then(d => {
          card.id = d[0];

          if (LangUtils.isDefined(card.parent)) {
            this.createLink(card.parent, card);
          }

          this.updateReferences(card);
        });
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
      .insert({card1_id: from.id, card2_id: to.id, creationDate: new Date()})
      .then(d => console.log(d));
  }

  private updateLinks(from: CardEntity, to: CardEntity[]) {
    this.dbService
      .getConnection('card_card')
      .where('card1_id', from.id)
      .del()
      .then(d => {
        console.log(d);

        const data = to.map(ce => {
          return {card1_id: from.id, card2_id: ce.id, creationDate: new Date()};
        });

        return this.dbService
          .getConnection('card')
          .insert(data);
      })
      .then(d => console.log(d));
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
          return {card_id: card.id, tag_id: tag.id, creationDate: new Date()};
        });

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
          .insert({name: tag.name, creationDate: new Date()})
          .returning('id')
      )
      .map(d => {
        tag.id = d[0];
        return null;
      });
  }

  private updateFiles(card: CardEntity, file: FileEntity[]) {
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
          const c = new CardEntity();
          c.title = 'My first card';
          c.content = 'Write something...';
          return Observable.of(c);
        }

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

  private getLinks(cardId: number): Observable<CardEntity[]> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card')
          .innerJoin('card_card', 'card_card.card2_id', 'card.id')
          .where('card_card.card1_id', cardId)
      )
      .flatMap((res: any[]) => {
        console.log(res);
        const os = res.map(r => this.mapCard(r));
        return Observable.forkJoin(os);
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
      .forkJoin(filesO, tagsO, linksO)
      .map(res => cardEntity);
  }

  public branchCard(parentCard: CardEntity): Observable<CardEntity> {
    const c = new CardEntity();
    c.content = '';
    c.title = '';

    // make sure the specified parent was persisted
    if (LangUtils.isDefined(parentCard.id)) {
      c.parent = parentCard;
    }

    return Observable.of(c);
  }
}
