import { Injectable, OnDestroy } from '@angular/core';
import { D3Service, ForceDirectedGraph, Link, Node } from '../d3';
import { LangUtils } from '../../util/lang.utils';
import { GraphOptions } from '../d3/models';
import { Subject } from 'rxjs/Subject';


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
      this.nodes.push(...nodes);

      if (LangUtils.isDefined(this.graph)) {
        this.graph.updateNodes();
      }
    }

    if (LangUtils.isArray(links && links.length > 0)) {
      this.links.push(...links);

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
}
