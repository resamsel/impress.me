import {PositionStrategy} from './position.strategy';
import {findIndex} from '../helpers';
import {ImpressMeConfig} from '../impress-me-config';
import {SlidePosition} from '../slide-position';
import {SlideNode} from '../slide-node';
import {Shape} from '../shape';
import {overviewPosition} from './linear-position.strategy';

export class ColumnPositionStrategy implements PositionStrategy {
  private readonly width = 1920;

  private readonly height: number;

  private readonly scale = 0.4;

  private readonly offset: SlidePosition;

  constructor(readonly config: ImpressMeConfig) {
    this.height = this.config.shape === Shape.Circle ? 1920 : 1080;
    this.offset = {
      x: -(this.config.width / 2) - (this.width * this.scale / 2),
      y: (this.height - 1080) * 0.2,
      z: 0,
      scale: this.scale,
    };
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('calculate', node);
    if (node.classes && node.classes.includes('overview')) {
      return overviewPosition(node, this.config, this.width, this.scale);
    }

    let siblingIndex: number;
    let siblings: SlideNode[];
    let previousSibling: SlideNode;
    switch (node.depth) {
      case 1:
        return {
          x: 0,
          y: 0,
          z: 0,
          scale: 1,
        };
      case 2: {
        siblingIndex = node.parent!.children.indexOf(node);
        if (siblingIndex === 0) {
          // first h2 step
          return {
            ...this.offset,
            x: this.offset.x + ((siblingIndex + 1) * this.width * this.offset.scale),
          };
        }
        siblings = node.parent!.children;
        previousSibling = siblings[siblingIndex - 1];
        return {
          ...this.offset,
          x: previousSibling.pos!.x + (this.width * this.offset.scale),
        };
      }
      default: {
        siblingIndex = findIndex(node.parent!, node);
        return {
          ...this.offset,
          x: node.parent!.pos!.x,
          y: this.offset.y + (siblingIndex * this.height * this.offset.scale),
        };
      }
    }
  }
}