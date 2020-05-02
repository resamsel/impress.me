import {Shape} from './shape';
import {Strategy} from './strategy';

export interface Theme {
  themeName: string;
  shape: Shape;
  strategy: Strategy;
}

export const themeMap: Record<string, Theme> = {
  classic: {
    themeName: 'classic',
    shape: Shape.None,
    strategy: Strategy.Linear,
  },
  planet: {
    themeName: 'planet',
    shape: Shape.Circle,
    strategy: Strategy.Planet,
  },
  slides: {
    themeName: 'slides',
    shape: Shape.Rounded,
    strategy: Strategy.Linear,
  },
  newspaper: {
    themeName: 'newspaper',
    shape: Shape.None,
    strategy: Strategy.Column,
  },
  gallery: {
    themeName: 'gallery',
    shape: Shape.None,
    strategy: Strategy.Row,
  },
};

export const themes = Object.keys(themeMap).map(key => themeMap[key]);
