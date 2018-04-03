import { Injectable, OnDestroy } from '@angular/core';
import { ArrayUtils } from '../../util/array.utils';
import { CardEntity } from '../entity/card.entity';
import { CardService } from './card.service';
import { EditService } from '../../presentation/services/edit.service';
import { GraphService } from '../../presentation/services/graph.service';
import { LangUtils } from '../../util/lang.utils';
import { Subject } from 'rxjs/Subject';
import { VisualizationService } from './visualization.service';


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
      .subscribe((card: CardEntity) => {
        // the previous card was an unsaved that is now deselected, in that case the previous card is removed from the graph
        if (LangUtils.isDefined(this.card) && this.card.id < 1) {
          this.graphService.removeNode(this.card.id);
        }

        this.card = card;
        this.visualizationService.createLinksForCard(card);
      });

    // init application
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  saveCard(): void {
    this.cardService
      .save(this.card)
      .subscribe((card) => {
        // publish the new state of the card (now should not be modified anymore)
        this.editService.emitModified(card.modified);

        this.graphService.nodes.forEach(graphNode =>
          // for each graph node, check whether it contains links to saved card but where card has no link to the graph node
          graphNode.card.links
            .filter(nodesLink =>
              nodesLink.id === card.id
              && ArrayUtils.containsNot(card.links, nodesLink, (a, b) => a.id === b.id)
            )
            .forEach(foundNodesLink => ArrayUtils.removeElement(graphNode.card.links, foundNodesLink))
        );

        card.links.forEach(link =>
          this.graphService.nodes
            .filter(graphNode =>
              graphNode.card.id === link.id
              && ArrayUtils.containsNot(graphNode.card.links, link, (a, b) => a.id === b.id)
            )
            .forEach(foundNode => foundNode.card.links.push(card))
        );


        // before the card was saved, new links or removed links where not shown in the graph
        this.visualizationService.recreateLinks(card);
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

  public branchCard(card: CardEntity): void {
    /**
     * in cases when a new card has been added previously but not changed and shall not be saved, the current new card will have the same
     * id (-1) but a different parent, therefore, we need to enforce the cardSelected event
     */
    this.cardService.branchCard(card).subscribe(newCard => this.editService.cardSelected(newCard, true));
  }
}
