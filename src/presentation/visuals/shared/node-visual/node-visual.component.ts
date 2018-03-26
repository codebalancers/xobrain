import { Component, Input } from '@angular/core';
import { Node } from '../../../d3';
import { EditService } from '../../../services/edit.service';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g [attr.transform]="'translate(' + node.x + ',' + node.y + ')'" (click)="handleClick()">
      <svg:circle
        class="node"
        [attr.fill]="node.color"
        cx="0"
        cy="0"
        [attr.r]="node.r">
      </svg:circle>
      <svg:text
        class="node-name"
        [attr.font-size]="node.fontSize">
        {{node.card.title}}
      </svg:text>
    </svg:g>
  `
})
export class NodeVisualComponent {
  @Input('nodeVisual') node: Node;

  constructor(private editService: EditService){}

  handleClick(){
    this.editService.cardSelected(this.node.card)
  }
}
