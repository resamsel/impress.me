import {Transformation} from './transformation';

export interface SlideNode {
  parent?: SlideNode;
  children: SlideNode[];
  depth: number;
  text: string;
  pos?: Transformation;
  attrs: Record<string, string>;
  classes?: string[];
}
