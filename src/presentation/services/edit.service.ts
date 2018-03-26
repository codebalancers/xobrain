import { Injectable, OnDestroy } from '@angular/core';
import { CardEntity } from '../../business/entity/card.entity';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { CardService } from '../../business/boundary/card.service';
import { GraphService } from './graph.service';
import { Link, Node } from '../d3/models';

@Injectable()
export class EditService implements OnDestroy {
  private _cardSelectedSubject = new ReplaySubject<CardEntity>();
  public readonly cardSelectedSubject$ = this._cardSelectedSubject.asObservable();

  constructor(private cardService: CardService, private graphService: GraphService) {
  }

  ngOnDestroy(): void {
    this._cardSelectedSubject.complete();
  }

  public cardSelected(card: CardEntity): void {
    this._cardSelectedSubject.next(card);

    this.cardService
      .updateChildren(card)
      .subscribe(card => {
        const nodes: Node[] = [];
        const links: Link[] = [];

        const parentNode = this.graphService.getNode(card.id);

        card.links.forEach(l => {
          const nc = new Node(l);
          nodes.push(nc);

          nc.x = parentNode.x;
          nc.y = parentNode.y;

          links.push(new Link(card.id, l.id));
        });

        this.graphService.pushElements(nodes, links);
      });

    this.cardService
      .findParents(card)
      .subscribe(cards => {
        const nodes: Node[] = [];
        const links: Link[] = [];

        const childNode = this.graphService.getNode(card.id);

        cards.forEach(l => {
          const np = new Node(l);
          nodes.push(np);

          np.x = childNode.x;
          np.y = childNode.y;

          links.push(new Link(l.id, card.id));
        });

        this.graphService.pushElements(nodes, links);
      })
  }
}
