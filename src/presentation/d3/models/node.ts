import APP_CONFIG from '../../../app/app.config';
import { CardEntity } from '../../../business/entity/card.entity';

export class Node implements d3.SimulationNodeDatum {
  // -- required fields used by d3
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  /**
   * Minimal required hobs to the selected node.
   * @type {number}
   */
  distanceToSelected = -1;

  get linkCount(): number {
    return this.card.links.length;
  }

  constructor(public card: CardEntity) {
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  };

  get r() {
    return 50 * this.normal() + 10;
  }

  get fontSize() {
    return (30 * this.normal() + 10) + 'px';
  }

  get color() {
    let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    return APP_CONFIG.SPECTRUM[ index ];
  }
}
