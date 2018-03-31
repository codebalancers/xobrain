import { Component, OnDestroy, OnInit } from '@angular/core';
import { Link, Node } from '../../d3/index';
import { CardService } from '../../../business/boundary/card.service';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';
import { GraphService } from '../../services/graph.service';
import { LangUtils } from '../../../util/lang.utils';
import { ArrayUtils } from '../../../util/array.utils';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../services/key.service';
import { KeyEvent } from '../../services/key-event';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  card: CardEntity;

  constructor(titleService: Title,
              private cardService: CardService,
              private editService: EditService,
              keyService: KeyService,
              private graphService: GraphService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => {
        // the previous card was an unsaved that is now deselected, in that case the previous card is removed from the graph
        if (LangUtils.isDefined(this.card) && this.card.id < 1) {
          this.graphService.removeNode(this.card.id);
        }

        this.card = card;
        this.createLinksForCard(card);
      });

    editService.cardModifiedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((modified: boolean) => {
        if (modified === true) {
          titleService.setTitle('* ' + 'Xobrain');
        } else {
          titleService.setTitle('Xobrain');
        }
      });

    keyService.keyEventSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((keyEvent: KeyEvent) => {
        if (keyEvent === KeyEvent.SAVE) {
          this.saveCard();
        }
      });
  }

  ngOnInit(): void {
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));
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
        this.recreateLinks(card);
      });
  }

  branchCard(): void {
    this.editService.branchCard(this.card);
  }

  addNewCard(): void {
    const c = new CardEntity();
    c.id = -1;
    c.content = '';
    c.title = '';
    this.editService.cardSelected(c);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
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

  private recreateLinks(card: CardEntity) {
    this.graphService.removeAllLinksForNode(card.id);
    this.createLinksForCard(this.card);
    this.graphService.refresh();
  }

  /**
   * Create all links of a card and also adds the required nodes to the graph, the links are pointing to.
   *
   * @param {CardEntity} card
   */
  private createLinksForCard(card: CardEntity): void {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const nc = new Node(card);
    nodes.push(nc);

    if (LangUtils.isArray(card.links)) {
      card.links.forEach(c => {
        nodes.push(new Node(c));
        links.push(new Link(card.id, c.id));
      });
    }

    if (card.id < 1 && card.links.length > 0) {
      // a new card shall be placed near the parent card, which should be the first card in the links array
      const parentNode = this.graphService.getNode(ArrayUtils.getFirstElement(card.links).id);
      nc.x = parentNode.x;
      nc.y = parentNode.y;
    }

    this.graphService.pushElements(nodes, links);
  }
}
