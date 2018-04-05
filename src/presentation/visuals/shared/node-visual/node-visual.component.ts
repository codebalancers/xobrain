import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EditService } from '../../../services/edit.service';
import { Subject } from 'rxjs/Subject';
import { CardEntity } from '../../../../business/entity/card.entity';
import { XobrainService } from '../../../../business/boundary/xobrain.service';
import { Node } from '../../../d3/models/node';
import { LangUtils } from '../../../../util/lang.utils';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
           (mouseenter)="handleMouseEnter()"
           (mouseleave)="handleMouseLeave()">
      <svg:g (mousedown)="handleClick()" class="nodeContent">
        <svg:circle
          [ngClass]="{'node': !selected, 'selected': selected}"
          [attr.fill]="getFillColor()"
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

      <svg:g *ngIf="showAdd" transform="translate(18,-18)" (mousedown)="handleAddClick()">
        <svg:circle class="addButton" r="20">
        </svg:circle>
        <svg:text class="addText">+</svg:text>
      </svg:g>

    </svg:g>
  `
})
export class NodeVisualComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  _selected: CardEntity;
  showAdd: boolean = false;

  @Input('nodeVisual') node: Node;

  constructor(private editService: EditService, private xobrainService: XobrainService) {
  }

  ngOnInit() {
    this.editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => this._selected = card);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  get selected(): boolean {
    if (LangUtils.isDefined(this._selected)) {
      return this._selected.id === this.node.card.id;
    } else {
      return false;
    }
  }

  getFillColor(): string {
    if (this.selected) {
      return 'yellow';
    } else if (this.node.distanceToSelected === 1) {
      return 'orange';
    } else {
      return this.node.color;
    }
  }

  handleClick() {
    this.editService.cardSelected(this.node.card);
  }

  handleAddClick() {
    this.xobrainService.branchCard(this.node.card);
  }

  handleMouseEnter() {
    this.showAdd = true;
  }

  handleMouseLeave() {
    this.showAdd = false;
  }
}
