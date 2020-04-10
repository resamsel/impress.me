import {PositionStrategy} from "./position.strategy";
import {ImpressMeConfig} from "../impress-me-config";
import {SlidePosition} from "../slide-position";
import {SlideNode} from "../slide-node";

const defaultPosition = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1
};

export class PlanetPositionStrategy implements PositionStrategy {
  private readonly offset: SlidePosition = {
    x: -this.config.width / 2 + 450,
    y: -this.config.height / 2 + 800,
    z: 0,
    scale: 0.4
  };

  constructor(private readonly config: ImpressMeConfig) {
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('PlanetPositionStrategy.calculate()', node);

    if (node === undefined) {
      return defaultPosition;
    }

    if (node.attrs && node.attrs['class']) {
      const classes = node.attrs['class'].split(' ');
      if (classes.includes('overview')) {
        return defaultPosition;
      }
    }

    const siblings = node.parent ? node.parent.children : [node];
    const siblingIndex = siblings.indexOf(node);
    switch (node.depth) {
      case 2: {
        //
        // Planet positioning
        //

        // const siblingCount = siblings.filter(includeSlide).length;
        const scale = 1 / (siblingIndex + 4);
        // const scale2 = this.config.width / (siblingCount * (this.config.width + this.config.stepDistance)) * scale;
        // debug('siblingCount', node.text, siblingCount, scale, scale2);
        return {
          x: this.offset.x + siblingIndex * this.config.stepDistance * Math.sqrt(scale),
          y: this.offset.y - Math.sqrt(siblingIndex) * 250,
          z: this.offset.z,
          scale
        };
      }
      case 3: {
        //
        // Satellite positioning
        //

        if (node.parent === undefined || node.parent.pos === undefined) {
          return {x: 0, y: 0, z: 0, scale: 1};
        }
        const parentPos = node.parent.pos;
        const scale = parentPos.scale / 5;
        const stepSizeScaled = (this.config.shapeSize + 100) * scale;
        const h = parentPos.x - this.config.shapeOffset * parentPos.scale;
        const k = parentPos.y;
        const r = (this.config.shapeSize / 2) * parentPos.scale + (this.config.shapeSize / 2 + 100) * scale;
        const c = r * 2 * Math.PI;
        const offsetRad = (stepSizeScaled / c) * 2 * Math.PI;
        const t = -offsetRad + offsetRad * (siblingIndex);
        return {
          x: r * Math.cos(t) + h,
          y: r * Math.sin(t) + k,
          z: 0,
          scale: scale
        };
      }
      default:
        return defaultPosition;
    }
  }
}
