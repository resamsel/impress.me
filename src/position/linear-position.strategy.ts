import {PositionStrategy} from './position.strategy';
import {findIndex, findRoot, flattenNodes} from '../helpers';
import {ImpressMeConfig} from '../impress-me-config';
import {SlidePosition} from '../slide-position';
import {SlideNode} from '../slide-node';

export class LinearPositionStrategy implements PositionStrategy {
  private readonly width = 1080;

  private readonly scale = 0.4;

  private readonly offset: SlidePosition;

  constructor(readonly config: ImpressMeConfig) {
    this.offset = {
      x: -this.config.width * 0.5,
      y: 100,
      z: 0,
      scale: this.scale,
    };
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('calculate', node);
    if (node.classes && node.classes.includes('overview')) {
      const root = findRoot(node);
      const nodes = flattenNodes(root);
      const minX = -(this.config.width / 2) - 16;
      const minY = -(this.config.height / 2) - 16;
      const maxX = nodes.map(n => n.pos ? n.pos.x + (this.width / 2 * this.scale) : 0)
        .reduce((max, curr) => Math.max(max, curr), this.config.width / 2) + 16;
      const maxY = nodes.map(n => n.pos ? n.pos.y + (this.width / 2 * this.scale) : 0)
        .reduce((max, curr) => Math.max(max, curr), this.config.height / 2) + 16;
      const totalWidth = maxX - minX;
      const totalHeight = maxY - minY;
      return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: 0,
        // we want to show a bit more than just all of the steps
        scale: Math.max(totalWidth / this.config.width, totalHeight / this.config.height),
      };
    }

    let step;
    switch (node.depth) {
      case 1:
        return {
          x: 0,
          y: 0,
          z: 0,
          scale: 1,
        };
      default:
        step = findIndex(findRoot(node), node);
        return {
          ...this.offset,
          x: this.offset.x + (step * this.config.width * this.offset.scale),
        };
    }
  }
}
