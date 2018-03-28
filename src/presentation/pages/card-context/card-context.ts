import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { CardService } from '../../../business/boundary/card.service';
import { StringUtils } from '../../../util/string.utils';
import { Subject } from 'rxjs/Subject';
import { EditService } from '../../services/edit.service';
import { ArrayUtils } from '../../../util/array.utils';
import { TagEntity } from '../../../business/entity/tag.entity';
import { TagService } from '../../../business/boundary/tag.service';

@IonicPage()
@Component({
  selector: 'card-context',
  templateUrl: 'card-context.html'
})
export class CardContextPage implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  card: CardEntity;

  foundCards: CardEntity[] = [];
  searchValue: string;

  foundTags: TagEntity[] = [];
  searchTagValue: string;

  constructor(private editService: EditService, private cardService: CardService, private tagService: TagService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => {
        this.card = card;

        // reset search
        this.searchValue = null;
        this.foundCards = [];
        this.searchTagValue = null;
        this.foundTags = [];
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  searchCards(): void {
    if (StringUtils.isBlank(this.searchValue)) {
      this.foundCards = [];
    } else {
      // self links are forbidden => remove the current card from the search result (if included)
      this.cardService.searchCard(this.searchValue)
        .map((cards: CardEntity[]) => cards.filter(c => c.id != this.card.id))
        .subscribe(cards => this.foundCards = cards);
    }
  }

  /**
   * @param {CardEntity} card that is added as link
   */
  addLink(card: CardEntity): void {
    this.card.links.push(card);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  /**
   * @param {CardEntity} card that is removed as link
   */
  removeLink(card: CardEntity): void {
    ArrayUtils.removeElement(this.card.links, card);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  canAddLink(card: CardEntity): boolean {
    return ArrayUtils.containsNot(this.card.links, card, (a, b) => a.id === b.id);
  }

  addTag(tag: TagEntity): void {
    this.card.tags.push(tag);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  canAddTag(tag: TagEntity): boolean {
    return ArrayUtils.containsNot(this.card.tags, tag, (a, b) => a.name === b.name);
  }

  removeTag(tag: TagEntity): void {
    ArrayUtils.removeElement(this.card.tags, tag);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  searchTags(): void {
    if (StringUtils.isBlank(this.searchTagValue)) {
      this.foundTags = [];
    } else {
      this.tagService
        .searchTags(this.searchTagValue)
        .map((tags: TagEntity[]) => {
          // add the search string itself to the beginning of the list, so a new tags can be created
          tags.unshift(new TagEntity(this.searchTagValue));
          return tags;
        })
        .subscribe(tags => this.foundTags = tags);
    }
  }
}
