import { Link } from './link';
import { Node } from './node';
import * as d3 from 'd3';
import { Subject } from 'rxjs/Subject';

const FORCES = {
  LINKS: 1 / 50,
  COLLISION: 1,
  CHARGE: -1
};

export interface GraphOptions {
  width: number
  height: number
}

export class ForceDirectedGraph {
  public ticker = new Subject<void>();
  public simulation: d3.Simulation<any, any>;

  constructor(private nodes: Node[],
              private links: Link[],
              options: GraphOptions) {
    if (!options || !options.width || !options.height) {
      throw new Error('missing options when initializing simulation');
    }

    this._initSimulation(options);
  }

  initNodes() {
    this.simulation.nodes(this.nodes);
  }

  initLinks() {
    this.simulation.force('links',
      d3.forceLink(this.links)
        .id(d => d['id'])
        .strength(FORCES.LINKS)
    );
  }

  public initSimulation(options: GraphOptions) {
    /** Updating the central force of the simulation */
    this.simulation.force('centers', d3.forceCenter(options.width / 2, options.height / 2));

    /** Restarting the simulation internal timer */
    this.simulation.restart();
  }

  private _initSimulation(options: GraphOptions) {
    /** Creating the simulation */
    this.simulation = d3.forceSimulation()
      .force('charge',
        d3.forceManyBody()
          .strength(d => FORCES.CHARGE * d['r'])
      )
      .force('collide',
        d3.forceCollide()
          .strength(FORCES.COLLISION)
          .radius(d => d['r'] + 5).iterations(2)
      );

    // Connecting the d3 ticker to an angular event emitter
    this.simulation.on('tick', () => this.ticker.next());

    this.initNodes();
    this.initLinks();
    this.initSimulation(options);
  }
}
