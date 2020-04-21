import {Theme} from './theme';
import {PositionStrategyFactory} from './position';
import {Strategy} from './strategy';
import {Shape} from './shape';

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
  theme: Theme;
  shape: Shape;
  strategy: Strategy;
  positionStrategyFactory: PositionStrategyFactory;
  transitionDuration: number;
  title?: string;
}
