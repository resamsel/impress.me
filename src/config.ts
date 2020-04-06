export interface Offset {
  top: number;
  left: number;
}

export interface ImpressMeConfig {
  width: number;
  height: number;
  offset: Offset;
  circleSize: number;
  circleOffset: number;
  stepDistance: number;
  primary: string;
  secondary: string;
  cssFiles: string[];
  slideShape: string;
  transitionDuration: number;
}

export interface SlidePosition {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface SlideNode {
  depth: number;
  text: string;
  pos?: SlidePosition;
  parent?: SlideNode;
  children: SlideNode[];
}

export interface ImpressMdState {
  root?: SlideNode;
  current?: SlideNode;
}
