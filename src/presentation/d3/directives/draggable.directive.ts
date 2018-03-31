import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Node } from '../models';
import { D3Service } from '../d3.service';
import { GraphService } from '../../services/graph.service';

@Directive({
  selector: '[draggableNode]'
})
export class DraggableDirective implements OnInit {
  @Input('draggableNode') draggableNode: Node;

  constructor(private d3Service: D3Service, private _element: ElementRef, private graphService: GraphService) {
  }

  ngOnInit() {
    this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.graphService.graph);
  }
}
