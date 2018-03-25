import { Component, OnDestroy, OnInit } from '@angular/core';
import { Link, Node } from '../../d3/index';
import { CardService } from '../../../business/boundary/card.service';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';
import { GraphService } from '../../services/graph.service';

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

        this.graphService.pushElements([new Node(44)], [new Link(1, 3)]);
        // this.links = [];
        // this.nodes = []

        // const root = new Node(card.id);
        // this.nodes.push(root);
        //
        // if (LangUtils.isArray(card.links)) {
        //   card.links.forEach(c => {
        //     console.log('add link');
        //     const child = new Node(c.id);
        //     this.nodes.push(child);
        //     this.links.push(new Link(root, child));
        //   });
        // }
      });


    graphService.pushElements(
      [new Node(1), new Node(2), new Node(3)],
      [new Link(1, 2)]
    );
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
