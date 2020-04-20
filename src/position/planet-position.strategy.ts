import {PositionStrategy} from './position.strategy';
import {ImpressMeConfig} from '../impress-me-config';
import {SlideNode} from '../slide-node';
import {includeSlide} from '../helpers';
import {overviewPosition} from './linear-position.strategy';
import {shapeConfig, ShapeConfig} from '../shape';
import {Spacing} from '../spacing';
import {Transformation} from '../transformation';

const defaultPosition = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
};

const scaleOf = (index: number, count: number): number =>
  1 / Math.sqrt((index + 2) * count * 3.5) * 1.25;

export class PlanetPositionStrategy implements PositionStrategy {
  private readonly spacing: Spacing = {
    top: 256,
    right: 64,
    bottom: 128,
    left: 64,
  };

  private readonly width = 1680;

  private readonly overviewNodeScale = 0.4;

  private readonly singleNodeScale = 1 / 3;

  private readonly shapeConfig: ShapeConfig;

  constructor(readonly config: ImpressMeConfig) {
    this.shapeConfig = shapeConfig[this.config.shape];
  }

  calculate(node: SlideNode): Transformation {
    // debug('PlanetPositionStrategy.calculate()', node);

    if (node === undefined) {
      return defaultPosition;
    }

    if (node.classes && node.classes.includes('overview')) {
      return overviewPosition(node, this.config, this.config.width, this.overviewNodeScale);
    }

    const siblings = node.parent ? node.parent.children : [node];
    const siblingIndex = siblings.indexOf(node);

    switch (node.depth) {
      case 2: {
        //
        // Planet positioning
        //

        const siblingCount = siblings.filter(includeSlide).length;
        if (siblingCount === 1) {
          return {
            x: -(this.config.width / 2) + (this.config.width * 1.6 / 2.6) - (this.shapeConfig.offset.x * this.singleNodeScale),
            y: Number(this.config.height / 2) - (this.config.height / 2.6),
            z: 0,
            scale: this.singleNodeScale,
          };
        }

        const scale = scaleOf(siblingIndex, siblingCount);
        const firstChildRadius = this.width / 2 * scaleOf(0, siblingCount);
        const lastChildRadius = this.width / 2 * scaleOf(siblingCount - 1, siblingCount);
        const maxWidth = this.config.width - this.spacing.left - this.spacing.right - firstChildRadius - lastChildRadius;
        const maxHeight = this.config.height - this.spacing.top - this.spacing.bottom - firstChildRadius - lastChildRadius;
        const factorX = maxWidth / (Math.sqrt(siblingCount) - 1);
        const factorY = maxHeight / Math.log(siblingCount + 1);
        const shapeOffsetX = this.shapeConfig.offset.x * scale;
        const shapeOffsetY = this.shapeConfig.offset.y * scale;
        const offsetLeft = -(this.config.width / 2) + this.spacing.left + firstChildRadius - shapeOffsetX;
        const offsetBottom = (this.config.height / 2) - this.spacing.bottom - firstChildRadius - shapeOffsetY;
        return {
          x: offsetLeft + ((Math.sqrt(siblingIndex + 1) - 1) * factorX),
          y: offsetBottom - (Math.log(siblingIndex + 1) * factorY),
          z: 0,
          scale: scale / (Math.sqrt(siblingCount + 4) / Math.sqrt(siblingCount - siblingIndex + 4)),
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
