import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Node } from '../../../d3';
import { EditService } from '../../../services/edit.service';
import { Subject } from 'rxjs/Subject';
import { CardEntity } from '../../../../business/entity/card.entity';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
           (mouseenter)="handleMouseEnter()"
           (mouseleave)="handleMouseLeave()">
      <svg:g (mousedown)="handleClick()" class="nodeContent">
        <svg:circle
          [ngClass]="{'node': !selected, 'selected': selected}"
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

      <svg:g *ngIf="showAdd" transform="translate(18,-18)" (click)="handleAddClick()">
        <svg:circle class="addButton" r="20">
        </svg:circle>
        <svg:text class="addText">+</svg:text>
      </svg:g>

    </svg:g>
  `
})
export class NodeVisualComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  selected: boolean = false;
  showAdd: boolean = false;

  @Input('nodeVisual') node: Node;

  constructor(private editService: EditService) {
  }

  ngOnInit() {
    this.editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => this.selected = card.id === this.node.card.id);
  }

  handleClick() {
    this.editService.cardSelected(this.node.card);
  }

  handleAddClick() {
    this.editService.branchCard(this.node.card);
  }

  handleMouseEnter() {
    // not allowed to branch unsaved cards
    if (this.node.card.id < 1) {
      return;
    }
    this.showAdd = true;
  }

  handleMouseLeave() {
    this.showAdd = false;
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
