import {SlidePosition} from './slide-position';

export enum Shape {
  Circle = 'circle',
  Rounded = 'rounded',
  None = 'none'
}

export const shapes = [Shape.Circle, Shape.Rounded, Shape.None];

export interface ShapeConfig {
  width: number;
  height: number;
  offset: SlidePosition;
}

export const shapeConfig: Record<Shape, ShapeConfig> = {
  [Shape.Circle]: {
    width: 1680,
    height: 1680,
    offset: {
      x: -500,
      y: 0,
      z: 0,
      scale: 0,
    },
  },
  [Shape.Rounded]: {
    width: 1680,
    height: 1680,
    offset: {
      x: 0,
      y: 0,
      z: 0,
      scale: 0,
    },
  },
  [Shape.None]: {
    width: 0,
    height: 0,
    offset: {
      x: 0,
      y: 0,
      z: 0,
      scale: 0,
    },
  },
};
