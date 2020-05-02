import {PositionStrategy} from './position.strategy';
import {findIndex} from '../helpers';
import {ImpressMeConfig} from '../impress-me-config';
import {SlideNode} from '../slide-node';
import {ShapeConfig, shapeConfig} from '../shape';
import {overviewPosition} from './linear-position.strategy';
import {Transformation} from '../transformation';

export class RowPositionStrategy implements PositionStrategy {
  private readonly shape: ShapeConfig;

  private readonly offset: Transformation;

  private readonly scale = 0.4;

  constructor(readonly config: ImpressMeConfig) {
    this.shape = shapeConfig[this.config.shape];
    this.offset = {
      x: -(this.config.width * this.scale / 2),
      y: (this.shape.height + this.shape.parentOffset.y - 1080) * 0.2,
      z: 0,
      scale: this.scale,
    };
  }

  calculate(node: SlideNode): Transformation {
    if (node.classes && node.classes.includes('overview')) {
      return overviewPosition(node, this.config, this.shape.width, this.scale);
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
            y: this.offset.y + (siblingIndex * this.shape.height * this.offset.scale),
          };
        }
        siblings = node.parent!.children;
        previousSibling = siblings[siblingIndex - 1];
        return {
          ...this.offset,
          y: previousSibling.pos!.y + ((this.shape.height + this.shape.siblingOffset.y) * this.offset.scale),
        };
      }
      default: {
        siblingIndex = findIndex(node.parent!, node);
        return {
          ...this.offset,
          x: this.offset.x + (siblingIndex * (this.shape.width + this.shape.siblingOffset.x) * this.offset.scale),
          y: node.parent!.pos!.y,
        };
      }
    }
  }
}
