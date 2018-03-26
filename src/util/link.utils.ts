import { Link, Node } from '../presentation/d3/models';

export class LinkUtils {
  public static equals(l1: Link, l2: Link): boolean {
    let l1SourceId: number;
    let l1TargetId: number;
    let l2SourceId: number;
    let l2TargetId: number;

    if (l1.source instanceof Node && l1.target instanceof Node) {
      l1SourceId = l1.source.card.id;
      l1TargetId = l1.target.card.id;
    } else if (typeof l1.source === 'number' && typeof l1.target === 'number') {
      l1SourceId = l1.source;
      l1TargetId = l1.target;
    } else {
      return false;
    }

    if (l2.source instanceof Node && l2.target instanceof Node) {
      l2SourceId = l2.source.card.id;
      l2TargetId = l2.target.card.id;
    } else if (typeof l2.source === 'number' && typeof l2.target === 'number') {
      l2SourceId = l2.source;
      l2TargetId = l2.target;
    } else {
      return false;
    }

    return l1SourceId === l2SourceId && l1TargetId === l2TargetId;
  }


  public static involves(cardId: number, link: Link): boolean {
    let lSourceId: number;
    let lTargetId: number;

    if (link.source instanceof Node && link.target instanceof Node) {
      lSourceId = link.source.card.id;
      lTargetId = link.target.card.id;
    } else if (typeof link.source === 'number' && typeof link.target === 'number') {
      lSourceId = link.source;
      lTargetId = link.target;
    } else {
      return false;
    }

    return cardId === lSourceId || cardId === lTargetId;
  }
}
