import { Node } from './node';

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  constructor(public source: string | number | Node,
              public target: string | number | Node) {
  }
}
