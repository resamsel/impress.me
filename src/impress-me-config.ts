import {PositionStrategyFactory} from './position';
import {Strategy} from './strategy';
import {Shape} from './shape';
import {SlideConfig} from './slide-config';

export interface ImpressMeConfig {
  basePath: string;
  template: string;
  width: number;
  height: number;
  shapeSize: number;
  shapeOffset: number;
  stepDistance: number;
  primary: string;
  secondary: string;
  cssFiles: string[];
  jsFiles: string[];
  theme: string;
  shape: Shape;
  strategy: Strategy;
  positionStrategyFactory: PositionStrategyFactory;
  transitionDuration: number;
  title?: string;

  /** Defines on the heading hierarchy starting at level 1 (true) or 2 (false) */
  hasInlineConfig: boolean;

  slide: SlideConfig;
}
