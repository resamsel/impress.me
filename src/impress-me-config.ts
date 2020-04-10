import {Theme} from "./theme";
import {PositionStrategyFactory} from "./position";

export interface ImpressMeConfig {
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
  shape: string;
  strategy: string;
  positionStrategyFactory: PositionStrategyFactory;
  transitionDuration: number;
  title?: string;
}
