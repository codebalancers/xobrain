import { Injectable, OnDestroy } from '@angular/core';
import { D3Service, ForceDirectedGraph, Link, Node } from '../d3';
import { LangUtils } from '../../util/lang.utils';
import { GraphOptions } from '../d3/models';
import { Subject } from 'rxjs/Subject';
import { ArrayUtils } from '../../util/array.utils';


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
        (add, elem) => add.source === elem.source && add.target === elem.target,
        ...links
      );

      if (LangUtils.isDefined(this.graph)) {
        this.graph.updateLinks();
      }
    }

    if (LangUtils.isDefined(this.graph)) {
      this.graph.restart();
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

  public updateLinks(oldId: number, newId: number): void {
    this.links.filter(l => l.source === oldId).forEach(l => l.source = newId);
    this.links.filter(l => l.target === oldId).forEach(l => l.target = newId);

    if (LangUtils.isDefined(this.graph)) {
      this.graph.updateNodes();
      this.graph.updateLinks();
      this.graph.restart();
    }
  }

  public refresh(): void {
    this.graph.restart();
  }

  public getNode(cardId: number): Node {
    return this.nodes.find(n => n.card.id === cardId);
  }
}
