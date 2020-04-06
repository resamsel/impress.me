import {PositionStrategy} from "./position.strategy";
import {ImpressMeConfig, SlideNode, SlidePosition} from "./config";
import {debug} from 'loglevel';
import {findIndex, findRoot, includeSlide} from "./helpers";

const slideCount = (node: SlideNode): number => {
  let count = includeSlide(node) ? 1 : 0;
  return node.children.reduce(
    (acc, child) => acc + slideCount(child),
    count
  );
};

export class LinearPositionStrategy implements PositionStrategy {
  private readonly offset: SlidePosition = {
    x: -this.config.width * 0.5,
    y: 100,
    z: 0,
    scale: 0.4
  };

  constructor(private readonly config: ImpressMeConfig) {
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('calculate', node);
    if (node.attrs && node.attrs['class']) {
      const classes = node.attrs['class'].split(' ');
      if (classes.includes('overview')) {
        const numberOfSteps = slideCount(findRoot(node));
        const maxX = this.offset.x + (numberOfSteps - 1) * this.config.width * this.offset.scale;
        debug('overview pos', maxX, numberOfSteps);
        return {
          x: this.offset.x * this.offset.scale + maxX / 2,
          y: this.offset.y,
          z: 0,
          // we want to show a bit more than just all of the steps
          scale: (numberOfSteps + 1) * this.offset.scale
        }
      }
    }

    switch (node.depth) {
      case 1:
        return {
          x: 0,
          y: 0,
          z: 0,
          scale: 1
        };
      default:
        const root = findRoot(node);
        const step = findIndex(root, node);
        return {
          ...this.offset,
          x: this.offset.x + step * this.config.width * this.offset.scale,
        };
    }
  }
}
