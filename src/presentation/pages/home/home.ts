import { Component, OnDestroy, OnInit } from '@angular/core';
import { Link, Node } from '../../d3/index';
import APP_CONFIG from '../../../app/app.config';
import { CardService } from '../../../business/boundary/card.service';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  nodes: Node[] = [];
  links: Link[] = [];
  card: CardEntity;

  constructor(private cardService: CardService, private editService: EditService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => this.card = card);

    const N = APP_CONFIG.N,
      getIndex = number => number - 1;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        this.nodes[ getIndex(i) ].linkCount++;
        this.nodes[ getIndex(i * m) ].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
  }

  ngOnInit(): void {
    this.cardService
      .getInitialCard()
      .subscribe(card => this.editService.cardSelected(card));
  }

  saveCard(): void {
    this.cardService.save(this.card);
  }

  branchCard(): void {

  }

  addNewCard(): void {

  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
