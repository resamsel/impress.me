import {PositionStrategy} from './position.strategy';
import {ImpressMeConfig} from '../impress-me-config';
import {SlidePosition} from '../slide-position';
import {SlideNode} from '../slide-node';
import {includeSlide} from '../helpers';
import {overviewPosition} from './linear-position.strategy';
import {shapeConfig, ShapeConfig} from '../shape';

const defaultPosition = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
};

const scaleOf = (index: number, count: number): number =>
  1 / Math.sqrt((index + 2) * count * 4);

export class PlanetPositionStrategy implements PositionStrategy {
  private readonly offset: SlidePosition;

  private readonly width = 1680;

  private readonly shapeConfig: ShapeConfig;

  constructor(readonly config: ImpressMeConfig) {
    this.offset = {
      x: 100,
      y: 128,
      z: 0,
      scale: 0.4,
    };
    this.shapeConfig = shapeConfig[this.config.shape];
  }

  calculate(node: SlideNode): SlidePosition {
    // debug('PlanetPositionStrategy.calculate()', node);

    if (node === undefined) {
      return defaultPosition;
    }

    if (node.classes && node.classes.includes('overview')) {
      return overviewPosition(node, this.config, this.config.width, this.offset.scale);
    }

    const siblings = node.parent ? node.parent.children : [node];
    const siblingIndex = siblings.indexOf(node);
    let scale: number;

    switch (node.depth) {
      case 2: {
        //
        // Planet positioning
        //

        scale = 1 / 3;
        const siblingCount = siblings.filter(includeSlide).length;
        if (siblingCount === 1) {
          return {
            x: -(this.config.width / 2) + (this.config.width * 1.6 / 2.6) - (this.shapeConfig.offset.x * scale),
            y: Number(this.config.height / 2) - (this.config.height / 2.6),
            z: 0,
            scale: scale,
          };
        }

        scale = scaleOf(siblingIndex, siblingCount);
        const firstChildRadius = this.width / 2 * scaleOf(0, siblingCount) * 1.25;
        const lastChildRadius = this.width / 2 * scaleOf(siblingCount - 1, siblingCount) * 1.25;
        const squeezeFactorX = 0.9;
        const squeezeFactorY = 1;
        const bendinessX = 1;
        const bendinessY = 1;
        const squeezeX = 1 + ((1 - squeezeFactorX) / squeezeFactorX);
        const squeezeY = 1 + ((1 - squeezeFactorY) / squeezeFactorY);
        const maxWidth = (this.config.width - (this.offset.x * 2) - firstChildRadius - lastChildRadius) * (squeezeX ** siblingIndex);
        const maxHeight = (this.config.height - (this.offset.y * 2) - firstChildRadius - lastChildRadius) * (squeezeY ** siblingIndex);
        const factorX = maxWidth / (Math.sqrt(siblingCount + 1) - 1) * (squeezeFactorX ** siblingIndex) * bendinessX * squeezeX;
        const factorY = maxHeight / Math.log(siblingCount + 1) * (squeezeFactorY ** siblingIndex) * bendinessY * squeezeY;
        const shapeOffsetX = this.shapeConfig.offset.x * scale;
        const shapeOffsetY = this.shapeConfig.offset.y * scale;
        const offsetLeft = -(this.config.width / 2) + this.offset.x + firstChildRadius - shapeOffsetX;
        const offsetBottom = (this.config.height / 2) - this.offset.y - firstChildRadius - shapeOffsetY;
        return {
          x: offsetLeft + ((Math.sqrt(siblingIndex + 1) - 1) * factorX),
          y: offsetBottom - (Math.log(siblingIndex + 1) * factorY),
          z: this.offset.z,
          scale: scale * 1.2,
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
        scale = parentPos.scale / 5;
        const shapeSize = this.shapeConfig.width;
        const shapeOffset = this.shapeConfig.offset.x + 100;
        const satelliteMargin = 192;
        const stepSizeScaled = (shapeSize + satelliteMargin) * scale;
        const h = parentPos.x + (shapeOffset * parentPos.scale);
        const k = parentPos.y;
        const r = (shapeSize / 2 * parentPos.scale) + (((shapeSize / 2) + satelliteMargin) * scale);
        const c = r * 2 * Math.PI;
        const offsetRad = (stepSizeScaled / c) * 2 * Math.PI;
        const t = -offsetRad + (offsetRad * siblingIndex);
        return {
          x: (r * Math.cos(t)) + h,
          y: (r * Math.sin(t)) + k,
          z: 0,
          scale,
        };
      }
      default:
        return defaultPosition;
    }
  }
}
