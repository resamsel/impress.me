export interface ImpressMeConfig {
  width: number;
  height: number;
  offset: SlidePosition;
  shapeSize: number;
  shapeOffset: number;
  stepDistance: number;
  primary: string;
  secondary: string;
  cssFiles: string[];
  shape: string;
  strategy: string;
  transitionDuration: number;
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
  attrs?: Record<string, string>;
  classes?: string[];
}

export interface ImpressMdState {
  root?: SlideNode;
  current?: SlideNode;
}
