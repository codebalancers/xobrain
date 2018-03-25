import { Component, OnDestroy, OnInit } from '@angular/core';
import { Link, Node } from '../../d3/index';
import { CardService } from '../../../business/boundary/card.service';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';
import { GraphService } from '../../services/graph.service';
import { LangUtils } from '../../../util/lang.utils';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  card: CardEntity;

  constructor(private cardService: CardService, private editService: EditService, private graphService: GraphService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => {
        this.card = card;

        const nodes: Node[] = [];
        const links: Link[] = [];

        if (LangUtils.isDefined(card.id)) {
          // handle persisted card
          nodes.push(new Node(card.id));

          if (LangUtils.isArray(card.links)) {
            card.links.forEach(c => {
              nodes.push(new Node(c.id));
              links.push(new Link(card.id, c.id));
            });
          }
        } else {
          // handle new
          nodes.push(new Node(-1));

          if (LangUtils.isDefined(card.parent)) {
            // handle branched card (has a parent)
            links.push(new Link(card.parent.id, -1));
          }
        }

        this.graphService.pushElements(nodes, links);
      });
  }

  ngOnInit(): void {
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));
  }

  saveCard(): void {
    this.cardService.save(this.card);
    // TODO after save the card has an ID and the graph must be updated
  }

  branchCard(): void {
    this.cardService
      .branchCard(this.card)
      .subscribe(newCard => this.editService.cardSelected(newCard));
  }

  addNewCard(): void {
    const c = new CardEntity();
    c.content = '';
    c.title = '';
    this.editService.cardSelected(c);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
