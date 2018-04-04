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
import { AssertUtils } from '../../util/assert.utils';

@Injectable()
export class CardService {

  constructor(private dbService: DatabaseService,
              private cardMapper: CardMapper,
              private linkService: LinkService,
              private tagService: TagService,
              private fileService: FileService) {
  }

  public updateLinks(card: CardEntity): Observable<CardEntity> {
    if (card.id < 1) {
      return Observable.of(card);
    }

    // TODO also update files and tags
    // this method potentially causes issues, because multiple instances of the same db entity are created
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
            .update({ title: card.title, content: card.content, modificationDate: new Date() })
        )
        .flatMap(d => this.updateReferences(card))
        .map(() => {
          card.modified = false;
          return card;
        });
    } else {
      // -- create
      return Observable
        .fromPromise(
          this.dbService
            .getConnection('card')
            .insert({ title: card.title, content: card.content, modificationDate: new Date() })
            .returning('id')
        )
        .flatMap(d => {
          // set auto-generated id
          card.id = d[ 0 ];
          return this.updateReferences(card);
        })
        .map(() => {
          card.modified = false;
          return card;
        });
    }
  }

  private updateReferences(card: CardEntity): Observable<void> {
    const os: Observable<void>[] = [];

    if (LangUtils.isArray(card.links)) {
      os.push(
        this.linkService.updateLinks(card, card.links.map(l => {
          return { card: l, weight: 1.0 };
        }))
      );
    }

    if (LangUtils.isArray(card.tags)) {
      os.push(
        this.tagService.updateTags(card, card.tags)
      );
    }

    if (LangUtils.isArray(card.files)) {
      os.push(
        this.fileService.updateFiles(card, card.files)
      );
    }

    if (os.length > 0) {
      return Observable.forkJoin(os).map(() => null);
    } else {
      return Observable.of(null);
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
          c.modified = true;

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
    AssertUtils.isTrue(parentCard.id > 0, 'It is not supported to branch from a non-persisted card');

    const c = new CardEntity();
    c.id = -1;
    c.content = '';
    c.title = '';
    c.links.push(parentCard);
    c.modified = false;

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

  public searchCard(searchValue: string): Observable<CardEntity[]> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('card')
          .where('title', 'LIKE', '%' + searchValue + '%')
          .or.where('content', 'LIKE', '%' + searchValue + '%')
      )
      .map((res: any[]) => res.map(card => this.cardMapper.mapFromDb(card)));
  }
}
