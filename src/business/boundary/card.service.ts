import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from '../control/database.service';
import { ArrayUtils } from '../../util/array.utils';
import { LangUtils } from '../../util/lang.utils';
import { LinkService } from './link.service';
import { TagService } from './tag.service';
import { FileService } from './file.service';
import { CardMapper } from './card.mapper';

@Injectable()
export class CardService {

  constructor(private dbService: DatabaseService,
              private cardMapper: CardMapper,
              private linkService: LinkService,
              private tagService: TagService,
              private fileService: FileService) {
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

    return this.linkService
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
            .insert({ title: card.title, content: card.content, modificationDate: new Date() })
            .returning('id')
        )
        .map(d => {
          // set auto-generated id
          card.id = d[ 0 ];

          // create link from parent
          if (LangUtils.isDefined(card.parent)) {
            this.linkService.createLink(card.parent, card);

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
      this.linkService.updateLinks(card, card.links);
    }

    if (LangUtils.isArray(card.tags)) {
      this.tagService.updateTags(card, card.tags);
    }

    if (LangUtils.isArray(card.files)) {
      this.fileService.updateFiles(card, card.files);
    }
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

  /**
   *
   * @param card
   * @param {boolean} references set to true, if also referenced entities shall be loaded
   * @return {Observable<CardEntity>}
   */
  private mapCard(card: any, references = false): Observable<CardEntity> {
    const cardEntity = this.cardMapper.mapFromDb(card);

    if (references === false) {
      return Observable.of(cardEntity);
    }

    const filesO = this.fileService.getFiles(cardEntity.id).map(files => {
      cardEntity.files = files;
      return null;
    });
    const tagsO = this.tagService.getTags(cardEntity.id).map(tags => {
      cardEntity.tags = tags;
      return null;
    });
    const linksO = this.linkService.getLinks(cardEntity.id).map(links => {
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
    return this.linkService
      .countAllLinks(card.id)
      .flatMap((links: number) => {
        if (links <= 1) {
          return this._deleteCard(card).map(() => true);
        } else {
          return Observable.of(false);
        }
      });
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
      });
  }
}
