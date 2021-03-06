import { Injectable, OnDestroy } from '@angular/core';
import { LangUtils } from '../../util/lang.utils';
import { Subject } from 'rxjs/Subject';
import { ArrayUtils } from '../../util/array.utils';
import { LinkUtils } from '../../util/link.utils';
import { Link } from '../d3/models/link';
import { ForceDirectedGraph, GraphOptions } from '../d3/models/force-directed-graph';
import { D3Service } from '../d3/d3.service';
import { Node } from '../d3/models/node';


@Injectable()
export class GraphService implements OnDestroy {
  private _ticksSubject = new Subject<void>();
  public readonly ticksSubject$ = this._ticksSubject.asObservable();

  public nodes: Node[] = [];
  public links: Link[] = [];
  public graph: ForceDirectedGraph;

  constructor(private d3Service: D3Service) {
  }

  public pushElements(nodes: Node[], links?: Link[]) {
    if (LangUtils.isArray(nodes) && nodes.length > 0) {
      ArrayUtils.pushIfNotPresent(
        this.nodes,
        (add, elem) => elem.card.id === add.card.id,
        ...nodes
      );

      if (LangUtils.isDefined(this.graph)) {
        this.graph.updateNodes();
      }
    }

    if (LangUtils.isArray(links) && links.length > 0) {
      ArrayUtils.pushIfNotPresent(
        this.links,
        (add, elem) => LinkUtils.equals(add, elem),
        ...links
      );

      if (LangUtils.isDefined(this.graph)) {
        this.graph.updateLinks();
      }
    }

    if (LangUtils.isDefined(this.graph)) {
      // this.graph.restart();
      this.graph.simulation.alphaTarget(0.3).restart();

      setTimeout(() => {
        this.graph.simulation.alphaTarget(0);
      }, 1000);
    }
  }

  public createGraph(options: GraphOptions): void {
    this.graph = this.d3Service.getForceDirectedGraph(this.nodes, this.links, options);
    this.graph.ticker.subscribe(() => this._ticksSubject.next());
  }

  public update(options: GraphOptions): void {
    this.graph.update(options);
  }

  ngOnDestroy(): void {
    this._ticksSubject.complete();
  }

  private _updateAll() {
    if (LangUtils.isDefined(this.graph)) {
      this.graph.updateNodes();
      this.graph.updateLinks();
      this.graph.restart();
    }
  }

  public refresh(): void {
    this._ticksSubject.next();
  }

  public getNode(cardId: number): Node {
    return this.nodes.find(n => n.card.id === cardId);
  }

  public removeNode(cardId: number): void {
    // -- remove node
    const node = this.nodes.find(n => n.card.id === cardId);
    ArrayUtils.removeElement(this.nodes, node);

    // -- remove links to to/from node
    this.removeAllLinksForNode(cardId);

    this._updateAll();

    setTimeout(() => {
      this.refresh();
    });
  }

  public removeAllLinksForNode(cardId: number): void {
    this.links
      .filter(l => LinkUtils.involves(cardId, l))
      .forEach(l => ArrayUtils.removeElement(this.links, l));
  }
}
