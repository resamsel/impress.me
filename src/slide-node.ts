import {SlidePosition} from "./slide-position";

export interface SlideNode {
  parent?: SlideNode;
  children: SlideNode[];
  depth: number;
  text: string;
  pos?: SlidePosition;
  attrs: Record<string, string>;
  classes?: string[];
}
