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

  /**
   * Effectively remove all existing links to the specified cards and recreate the links.
   *
   * @param {CardEntity} card
   */
  public recreateLinks(card: CardEntity) {
    console.log('recreateLinks', card);

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
    console.log('createLinksForCard', card);

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

      node.x = nc.x + (Math.random() - 0.5) * 40;
      node.y = nc.y + (Math.random() - 0.5) * 40;

      links.push(new Link(card.id, l.id));
    });

    if (card.id < 1 && card.links.length > 0) {
      // a new card shall be placed near the parent card, which should be the first card in the links array
      const parentNode = this.graphService.getNode(ArrayUtils.getFirstElement(card.links).id);

      if (LangUtils.isDefined(parentNode)) {
        nc.x = parentNode.x + (Math.random() - 0.5) * 40;
        nc.y = parentNode.y + (Math.random() - 0.5) * 40;
      }
    }

    this.graphService.pushElements(nodes, links);
  }

  /**
   * Remove all nodes whose distance is longer than specified.
   *
   * @param {CardEntity} card from which distance is measured
   * @param {number} maxDistance maximal distance from card which is allowed
   */
  public removeNodesByDistance(card: CardEntity, maxDistance: number) {
    // reset the distance for each node to initialized
    this.graphService.nodes.forEach(n => n.distanceToSelected = -1);

    const root = this.graphService.getNode(card.id);
    root.distanceToSelected = 0;
    let nodes: Node[] = [ root ];

    for (let distance = 1; distance <= maxDistance; distance++) {
      console.log('mark nodes', nodes, distance);
      const childNodes: Node[] = [];

      nodes.forEach(node => {
        node.card.links.forEach(link => {
          const linkedNode = this.graphService.getNode(link.id);

          if (LangUtils.isDefined(linkedNode) && linkedNode.distanceToSelected === -1) {
            linkedNode.distanceToSelected = distance;
            childNodes.push(linkedNode);
          }

        })
      });

      nodes = childNodes;
    }

    this.graphService.nodes
      .filter(n => n.distanceToSelected === -1)
      .forEach(n => this.graphService.removeNode(n.card.id));
  }
}
