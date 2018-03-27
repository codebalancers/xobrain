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
              private graphService: GraphService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => {
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
  }

  ngOnInit(): void {
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));
  }

  saveCard(): void {
    this.cardService
      .save(this.card)
      .subscribe((card) => this.updateCard(card));
  }

  branchCard(): void {
    this.cardService
      .branchCard(this.card)
      .subscribe(newCard => this.editService.cardSelected(newCard));
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
          // delete node from graph
          this.graphService.removeNode(this.card.id);

          // -- delete all references from links to deleted card
          this.graphService.nodes.forEach(n => {
            n.card.links
              .filter(l => l.id === this.card.id)
              .forEach(l => ArrayUtils.removeElement(n.card.links, l));

            if (LangUtils.isDefined(n.card.parent) && n.card.parent.id === this.card.id) {
              n.card.parent = null;
            }
          });

          // -- set card to editor
          this.cardService
            .getInitialCard()
            .subscribe(card => this.editService.cardSelected(card));
        } else {
          console.log('could not delete card');
        }
      });
  }

  private updateCard(card: CardEntity) {
    this.graphService.removeLinksOfNode(card.id);
    this.createLinksForCard(this.card);
    this.graphService.refresh();
  }

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

    if (LangUtils.isDefined(card.parent)) {
      // handle branched card (has a parent)
      links.push(new Link(card.parent.id, card.id));

      const parentNode = this.graphService.getNode(card.parent.id);
      nc.x = parentNode.x;
      nc.y = parentNode.y;
    }

    this.graphService.pushElements(nodes, links);
  }
}
