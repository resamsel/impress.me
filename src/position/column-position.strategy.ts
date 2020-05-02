import {PositionStrategy} from './position.strategy';
import {findIndex} from '../helpers';
import {ImpressMeConfig} from '../impress-me-config';
import {SlideNode} from '../slide-node';
import {Shape, ShapeConfig, shapeConfig} from '../shape';
import {overviewPosition} from './linear-position.strategy';
import {Transformation} from '../transformation';

export class ColumnPositionStrategy implements PositionStrategy {
  private readonly width = 1920;

  private readonly height: number;

  private readonly scale = 0.4;

  private readonly offset: Transformation;

  private readonly shape: ShapeConfig;

  constructor(readonly config: ImpressMeConfig) {
    this.shape = shapeConfig[this.config.shape];
    this.height = this.config.shape === Shape.Circle ? 1920 : 1080;
    this.offset = {
      x: -(this.config.width / 2) - ((this.shape.width + this.shape.siblingOffset.x) * this.scale / 2),
      y: (this.height - 1080) * 0.2,
      z: 0,
      scale: this.scale,
    };
  }

  calculate(node: SlideNode): Transformation {
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
            x: this.offset.x + ((this.shape.width + this.shape.siblingOffset.x) * this.offset.scale),
          };
        }
        siblings = node.parent!.children;
        previousSibling = siblings[siblingIndex - 1];
        return {
          ...this.offset,
          x: previousSibling.pos!.x + ((this.shape.width + this.shape.siblingOffset.x) * this.offset.scale),
        };
      }
      default: {
        siblingIndex = findIndex(node.parent!, node);
        return {
          ...this.offset,
          x: node.parent!.pos!.x,
          y: this.offset.y + ((this.shape.height + this.shape.siblingOffset.y) * siblingIndex * this.offset.scale),
        };
      }
    }
  }
}
