import {PositionStrategy} from "./position.strategy";
import {SlideNode, SlidePosition} from "./config";

const findRoot = (node: SlideNode): SlideNode => {
  if (node.parent === undefined) {
    // already root
    return node;
  }
  if (node.parent.parent === undefined) {
    return node.parent;
  }
  return node.parent.parent;
};

const findIndex = (root: SlideNode, node: SlideNode): number => {
  if (root === node) {
    return 0;
  }
  let index = 0;
  for (let child of root.children) {
    index += 1;
    if (child === node) {
      return index;
    }
    for (let child2 of child.children) {
      index += 1;
      if (child2 === node) {
        return index;
      }
    }
  }

  return -1;
};

export class LinearPositionStrategy implements PositionStrategy {
  calculate(node: SlideNode): SlidePosition {
    const root = findRoot(node);
    const step = findIndex(root, node);
    return {
      x: (step - 1) * 1000,
      y: 0,
      z: 0,
      scale: 0.5
    };
  }
}
