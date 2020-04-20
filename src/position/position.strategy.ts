import {SlideNode} from '../slide-node';
import {Transformation} from '../transformation';

export interface PositionStrategy {
  calculate(node: SlideNode): Transformation;
}
