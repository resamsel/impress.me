import {Theme} from "./theme";

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
  transitionDuration: number;
  title?: string;
}

export interface SlidePosition {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface SlideNode {
  parent?: SlideNode;
  children: SlideNode[];
  depth: number;
  text: string;
  pos?: SlidePosition;
  attrs: Record<string, string>;
  classes?: string[];
}

export interface SlideNodeState {
  root: SlideNode;
  nodes: Record<string, SlideNode>;
  isOpen: boolean;
}
