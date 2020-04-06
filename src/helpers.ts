import * as path from "path";
import * as fs from "fs";
import {SlideNode} from "./config";

export const noSlideClasses = ['title', 'overview', 'background', 'end'];
const module_path = path.dirname(__dirname);

export const resolve_path = (path: string): string => {
  return [
    module_path + '/' + path,
    path,
    'node_modules/' + path,
    '../' + path
  ].find(fs.existsSync) || path;
};

export const findRoot = (node: SlideNode): SlideNode => {
  if (node.parent === undefined) {
    // already root
    return node;
  }
  if (node.parent.parent === undefined) {
    return node.parent;
  }
  return node.parent.parent;
};

export const findIndex = (root: SlideNode, node: SlideNode): number => {
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

export const includeSlide = (node: SlideNode): boolean =>
  noSlideClasses.find(cls => (node.classes || ['title']).includes(cls)) === undefined;
