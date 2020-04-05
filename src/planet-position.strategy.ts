import {ImpressMeConfig, SlideNode, SlidePosition} from "./config";
import {PositionStrategy} from "./position.strategy";
import {debug} from "loglevel";

const defaultPosition = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1
};

export class PlanetPositionStrategy implements PositionStrategy {
  constructor(private readonly config: ImpressMeConfig) {
  }

  calculate(node: SlideNode): SlidePosition {
    debug('PlanetPositionStrategy.calculate()', node);

    if (node === undefined) {
      return defaultPosition;
    }

    const siblings = node.parent ? node.parent.children : [node];
    const siblingIndex = siblings.indexOf(node);
    switch (node.depth) {
      case 2: {
        const scale = 1 / (siblingIndex + 4);
        return {
          x: -(this.config.width / 2) + this.config.offset.left + (siblingIndex) * this.config.stepDistance,
          y: -(this.config.height / 2) + this.config.offset.top - Math.sqrt((siblingIndex) * 50000),
          z: 0,
          scale
        };
      }
      case 3: {
        if (node.parent === undefined || node.parent.pos === undefined) {
          return {x: 0, y: 0, z: 0, scale: 1};
        }
        const parentPos = node.parent.pos;
        const scale = parentPos.scale / 5;
        const stepSizeScaled = (this.config.circleSize + 100) * scale;
        const h = parentPos.x - this.config.circleOffset * parentPos.scale;
        const k = parentPos.y;
        const r = (this.config.circleSize / 2) * parentPos.scale + (this.config.circleSize / 2 + 100) * scale;
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
