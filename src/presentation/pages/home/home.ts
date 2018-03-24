import { Component, OnInit } from '@angular/core';
import { Link, Node } from '../../d3/index';
import APP_CONFIG from '../../../app/app.config';
import { CardService } from '../../../business/boundary/card.service';
import { CardViewPage } from '../card-view/card-view';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  nodes: Node[] = [];
  links: Link[] = [];

  tab1 = 'CardViewPage';
  tab2 = 'CardEditorPage';

  constructor(private cardService: CardService) {
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
      .getCard(0)
      .subscribe(rows => console.log('result', rows));
  }
}
