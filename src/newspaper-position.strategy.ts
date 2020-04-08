import {PositionStrategy} from "./position.strategy";
import {ImpressMeConfig, SlideNode, SlidePosition} from "./config";
import {debug} from 'loglevel';
import {findIndex, findRoot, flattenNodes, includeSlide} from "./helpers";

const slideCount = (node: SlideNode): number => {
  let count = includeSlide(node) ? 1 : 0;
  return node.children.reduce(
    (acc, child) => acc + slideCount(child),
    count
  );
};

export class NewspaperPositionStrategy implements PositionStrategy {
  private readonly width = this.config.shape === 'none' ? 1080 : 1920;
  private readonly height = 1080;
  private readonly scale = 0.4;
  private readonly offset: SlidePosition = {
    x: -this.config.width / 2 - this.width * this.scale / 2,
    y: 0,
    z: 0,
    scale: this.scale
  };

  constructor(private readonly config: ImpressMeConfig) {
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('calculate', node);
    if (node.classes && node.classes.includes('overview')) {
      const root = findRoot(node);
      const nodes = flattenNodes(root);
      const minX = -this.config.width / 2 - 16;
      const minY = -this.config.height / 2 - 16;
      const maxX = nodes.map(n => n.pos ? n.pos.x + this.width / 2 * this.scale : 0)
        .reduce((max, curr) => Math.max(max, curr), this.config.width / 2) + 16;
      const maxY = nodes.map(n => n.pos ? n.pos.y + this.width / 2 * this.scale : 0)
        .reduce((max, curr) => Math.max(max, curr), this.config.height / 2) + 16;
      const totalWidth = maxX - minX;
      const totalHeight = maxY - minY;
      debug('overview pos', maxX, maxY);
      return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: 0,
        // we want to show a bit more than just all of the steps
        scale: Math.max(totalWidth / this.config.width, totalHeight / this.config.height)
      };
    }

    switch (node.depth) {
      case 1:
        return {
          x: 0,
          y: 0,
          z: 0,
          scale: 1
        };
      case 2: {
        const siblingIndex = node.parent!.children.indexOf(node);
        if (siblingIndex === 0) {
          // first h2 step
          return {
            ...this.offset,
            x: this.offset.x + (siblingIndex + 1) * this.width * this.offset.scale,
          };
        }
        const siblings = node.parent!.children;
        const previousSibling = siblings[siblingIndex - 1];
        return {
          ...this.offset,
          x: previousSibling.pos!.x + this.width * this.offset.scale,
        };
      }
      default: {
        const siblingIndex = findIndex(node.parent!, node);
        return {
          ...this.offset,
          x: node.parent!.pos!.x,
          y: this.offset.y + siblingIndex * this.height * this.offset.scale,
        };
      }
    }
  }
}
