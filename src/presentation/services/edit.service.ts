import { Injectable, OnDestroy } from '@angular/core';
import { CardEntity } from '../../business/entity/card.entity';
import { CardService } from '../../business/boundary/card.service';
import { GraphService } from './graph.service';
import { Link, Node } from '../d3/models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class EditService implements OnDestroy {
  private _cardSelectedSubject = new BehaviorSubject<CardEntity>(new CardEntity());
  public readonly cardSelectedSubject$ = this._cardSelectedSubject.asObservable();

  private _cardModifiedSubject = new BehaviorSubject<boolean>(false);
  public readonly cardModifiedSubject$ = this._cardModifiedSubject.asObservable();

  constructor(private cardService: CardService, private graphService: GraphService) {
  }

  ngOnDestroy(): void {
    this._cardSelectedSubject.complete();
    this._cardModifiedSubject.complete();
  }

  public emitModified(modified: boolean): void {
    // do not emit an event if modified has not changed
    if (this._cardModifiedSubject.getValue() === modified) {
      return;
    }

    this._cardModifiedSubject.next(modified);
  }

  public cardSelected(card: CardEntity): void {
    // do not emit an event if selection has not changed
    if (this._cardSelectedSubject.getValue().id == card.id) {
      return;
    }

    this._cardSelectedSubject.next(card);

    this.cardService
      .updateLinks(card)
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
  }
}
