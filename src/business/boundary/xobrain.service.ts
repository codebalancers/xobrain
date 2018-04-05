import { Injectable, OnDestroy } from '@angular/core';
import { ArrayUtils } from '../../util/array.utils';
import { CardEntity } from '../entity/card.entity';
import { CardService } from './card.service';
import { EditService } from '../../presentation/services/edit.service';
import { GraphService } from '../../presentation/services/graph.service';
import { LangUtils } from '../../util/lang.utils';
import { Subject } from 'rxjs/Subject';
import { VisualizationService } from './visualization.service';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class XobrainService implements OnDestroy {
  private card: CardEntity;
  private componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private cardService: CardService,
              private editService: EditService,
              private visualizationService: VisualizationService,
              private graphService: GraphService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((selectedCard: CardEntity) => this.handleCardSelection(selectedCard));

    // init application
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));

    // notify about modification status of current card
    this.editService.emitModified(this.card.modified);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  public saveCard(): void {
    this.cardService
      .save(this.card)
      .subscribe((card) => {
        // publish the new state of the card (now should not be modified anymore)
        this.editService.emitModified(card.modified);

        this.updateReferencesForCard(card);
      });
  }

  public deleteCard(): void {
    this.cardService
      .deleteCard(this.card)
      .subscribe(success => {
        if (success === true) {
          // delete node and all involved links from graph
          this.graphService.removeNode(this.card.id);

          /**
           * delete all references from links to the deleted card that are still present in the CardEntities which have
           * not been reloaded
           */
          this.graphService.nodes.forEach(n => {
            n.card.links
              .filter(l => l.id === this.card.id)
              .forEach(l => ArrayUtils.removeElement(n.card.links, l));
          });

          /**
           * Since the previous selected card was just removed, the initial card is selected again.
           */
          this.cardService
            .getInitialCard()
            .subscribe(card => this.editService.cardSelected(card));
        } else {
          console.log('could not delete card');
        }
      });
  }

  public addNewCard(): void {
    const c = new CardEntity();
    c.id = -1;
    c.content = '';
    c.title = '';
    this.editService.cardSelected(c);
  }

  /**
   * Create a new card with the specified card as parent.
   *
   * @param {CardEntity} card parent card from which shall be branched a new card
   */
  public branchCard(card: CardEntity): void {
    /**
     * In cases when a new card has been added previously but not changed and shall not be saved, the current new card will have the same
     * id (-1) but a different parent, therefore, we need to enforce the cardSelected event.
     *
     * If the card that shall be branched was not yet persisted, we need to do that first, before this card can be the
     * parent of the new card.
     */
    if (card.id < 1) {
      this.cardService
        .save(card)
        .flatMap(savedCard => {
          this.updateReferencesForCard(savedCard);
          return this.cardService.branchCard(savedCard);
        })
        .subscribe(newCard => this.editService.cardSelected(newCard, true));
    } else {
      Observable.of(card)
        .flatMap((c: CardEntity) => {
          /**
           *  if the parent card is not the current selected card and has no links, the probability is high, that the links of the parent
           *  card have never been loaded, so we need to do this now.
           */
          if ((c.id) !== this.card.id && c.links.length === 0) {
            return this.cardService.updateLinks(c);
          } else {
            return Observable.of(c);
          }
        })
        .flatMap(c => this.cardService.branchCard(card))
        .subscribe(newCard => this.editService.cardSelected(newCard, true));
    }
  }

  /**
   * After a card was saved, the saved card contains links to other cards, the other cards do not know yet. Also links to other cards may
   * have been deleted and the previously linked cards still maintain the deleted links. For both situations we must update all links
   * to the specified card.
   *
   * @param {CardEntity} card that contains recently modified links
   */
  private updateReferencesForCard(card: CardEntity) {
    /**
     * remove all outdated links from other cards to the specified card
     */
    this.graphService.nodes.forEach(graphNode =>
      // for each graph node, check whether it contains links to the card but where card has no link to the graph node
      graphNode.card.links
        .filter(nodesLink =>
          nodesLink.id === card.id
          && ArrayUtils.containsNot(card.links, nodesLink, (a, b) => a.id === b.id)
        )
        .forEach(foundNodesLink => ArrayUtils.removeElement(graphNode.card.links, foundNodesLink))
    );

    /**
     * create new links to the specified card
     */
    card.links.forEach(link =>
      this.graphService.nodes
        .filter(graphNode =>
          graphNode.card.id === link.id
          && ArrayUtils.containsNot(graphNode.card.links, link, (a, b) => a.id === b.id)
        )
        .forEach(foundNode => foundNode.card.links.push(card))
    );


    /**
     * now, after the underlying model has been updated to the new situation, the graph also must be updated
     */
    this.visualizationService.recreateLinks(card);
  }

  private handleCardSelection(selectedCard: CardEntity) {
    let o = Observable.of(null);

    // -- if the previous card was modified, auto-save that card and update the linked cards
    if (LangUtils.isDefined(this.card) && this.card.modified === true) {
      o = this.cardService
        .save(this.card)
        .map(savedCard => this.updateReferencesForCard(savedCard));
    }
    // -- the previous card was an unmodified, unsaved that is now deselected, in that case the previous card is removed from the graph
    else if (LangUtils.isDefined(this.card) && this.card.id < 1) {
      this.graphService.removeNode(this.card.id);
    }

    // -- in any case: create new links for selected card and remove far-away nodes
    o.subscribe(() => {
      this.visualizationService.createLinksForCard(selectedCard);
      this.visualizationService.removeNodesByDistance(selectedCard, 2);

      this.card = selectedCard;
    });
  }
}
