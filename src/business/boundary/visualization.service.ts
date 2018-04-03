import { Injectable } from '@angular/core';
import { LangUtils } from '../../util/lang.utils';
import { ArrayUtils } from '../../util/array.utils';
import { CardEntity } from '../entity/card.entity';
import { GraphService } from '../../presentation/services/graph.service';
import { Link } from '../../presentation/d3/models/link';
import { Node } from '../../presentation/d3/models/node';

@Injectable()
export class VisualizationService {

  constructor(private graphService: GraphService) {
  }

  public recreateLinks(card: CardEntity) {
    this.graphService.removeAllLinksForNode(card.id);
    this.createLinksForCard(card);
    this.graphService.refresh();
  }

  /**
   * Create all links of a card and also adds the required nodes to the graph, the links are pointing to.
   *
   * @param {CardEntity} card
   */
  public createLinksForCard(card: CardEntity): void {
    const nodes: Node[] = [];
    const links: Link[] = [];

    let nc = this.graphService.getNode(card.id);
    if (LangUtils.isUndefined(nc)) {
      nc = new Node(card);
      nodes.push(nc);
    }

    card.links.forEach(l => {
      const node = new Node(l);
      nodes.push(node);

      node.x = nc.x;
      node.y = nc.y;

      links.push(new Link(card.id, l.id));
    });

    if (card.id < 1 && card.links.length > 0) {
      // a new card shall be placed near the parent card, which should be the first card in the links array
      const parentNode = this.graphService.getNode(ArrayUtils.getFirstElement(card.links).id);

      if (LangUtils.isDefined(parentNode)) {
        nc.x = parentNode.x;
        nc.y = parentNode.y;
      }
    }

    this.graphService.pushElements(nodes, links);
  }
}
