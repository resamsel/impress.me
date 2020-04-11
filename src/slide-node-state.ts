import {SlideNode} from './slide-node';

export interface SlideNodeState {
  root: SlideNode;
  nodes: Record<string, SlideNode>;
  isOpen: boolean;
}
