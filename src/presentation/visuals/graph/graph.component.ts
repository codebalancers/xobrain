import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { GraphOptions, Link, Node } from '../../d3/models';
import { GraphService } from '../../services/graph.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'graph',
  styles: [':host { display: block; height: 100%}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg #svg width="100%" height="100%">
      <g [zoomableOf]="svg">
        <g [linkVisual]="link" *ngFor="let link of links"></g>
        <g [nodeVisual]="node" *ngFor="let node of nodes"
           [draggableNode]="node"></g>
      </g>
    </svg>
  `
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  nodes: Node[];
  links: Link[];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.graphService.update(this.options);
  }

  constructor(private ref: ChangeDetectorRef, private el: ElementRef, private graphService: GraphService) {
    this.nodes = graphService.nodes;
    this.links = graphService.links;
  }

  ngOnInit() {
    this.graphService.createGraph(this.options);
    this.graphService.ticksSubject$.takeUntil(this.componentDestroyed$).subscribe(() => this.ref.markForCheck());
  }

  ngAfterViewInit() {
    this.graphService.update(this.options);
  }

  private get options(): GraphOptions {
    const width = this.el.nativeElement.clientWidth;
    const height = this.el.nativeElement.clientHeight;

    return {
      width: width,
      height: height
    };
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
