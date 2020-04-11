import {SlidePosition} from '../slide-position';
import {SlideNode} from '../slide-node';

export interface PositionStrategy {
  calculate(node: SlideNode): SlidePosition;
}
