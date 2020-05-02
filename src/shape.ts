import {Translation} from './translation';

export enum Shape {
  Circle = 'circle',
  Square = 'square',
  Rounded = 'rounded',
  None = 'none'
}

export interface ShapeConfig {
  width: number;
  height: number;
  offset: Translation;
  parentOffset: Translation;
  siblingOffset: Translation;
}

export const shapeConfig: Record<Shape, ShapeConfig> = {
  [Shape.Circle]: {
    width: 1680,
    height: 1680,
    offset: {x: -500, y: 0, z: 0},
    parentOffset: {x: 64, y: 0, z: 0},
    siblingOffset: {x: 300, y: 200, z: 0},
  },
  [Shape.Square]: {
    width: 1600,
    height: 1600,
    offset: {x: -500, y: 0, z: 0},
    parentOffset: {x: 200, y: 0, z: 0},
    siblingOffset: {x: 320, y: 100, z: 0},
  },
  [Shape.Rounded]: {
    width: 1500,
    height: 1000,
    offset: {x: -300, y: 0, z: 0},
    parentOffset: {x: 0, y: 0, z: 0},
    siblingOffset: {x: 420, y: 64, z: 0},
  },
  [Shape.None]: {
    width: 1920,
    height: 1080,
    offset: {x: 0, y: 0, z: 0},
    parentOffset: {x: 0, y: 0, z: 0},
    siblingOffset: {x: 128, y: 64, z: 0},
  },
};

export const shapes = Object.keys(shapeConfig) as Shape[];
