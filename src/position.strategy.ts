import {SlideNode, SlidePosition} from "./config";

export interface PositionStrategy {
  calculate(node: SlideNode): SlidePosition;
}
