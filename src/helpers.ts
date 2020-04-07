import * as path from "path";
import * as fs from "fs";
import {ImpressMeConfig, SlideNode, SlideNodeState} from "./config";
import {PositionStrategy} from "./position.strategy";
import {LinearPositionStrategy} from "./linear-position.strategy";
import {PlanetPositionStrategy} from "./planet-position.strategy";
import * as marked from "marked";
import {debug} from "loglevel";
import Heading = marked.Tokens.Heading;
import * as CleanCss from "clean-css";
import {promises} from "fs";
import {minify} from "uglify-es";
import {compileFile} from "pug";

export const noSlideClasses = ['title', 'overview', 'background', 'end'];
export const attrPattern = /(.*\S)\s*(\[]\(|<a href=")([^"]*)(\)|"><\/a>)\s*/;
export const attrItemPattern = /([^=,]+)\s*=\s*([^=,]+)/g;
const module_path = path.dirname(__dirname);

export const resolvePath = (path: string): string => {
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

export const createPositionStrategy = (config: ImpressMeConfig): PositionStrategy => {
  switch (config.strategy) {
    case 'linear':
      return new LinearPositionStrategy(config);
    case 'planet':
    default:
      return new PlanetPositionStrategy(config);
  }
};

const cleanCss = new CleanCss();

export const minifyCss = (cssFiles: string[]) =>
  Promise.all(
    cssFiles.map(file => promises.readFile(file, 'utf8')
      .then((data: string) => cleanCss.minify(data.toString()).styles)))
    .then(outputs => outputs.join('\n'));


export const minifyJs = (jsFiles: string[]) =>
  Promise.all(
    jsFiles.map(file => promises.readFile(file, 'utf8')
      .then((data: string) => minify(data.toString()).code)))
    .then(outputs => outputs.join(';'));

export const renderTemplate = (template: string, html: string, js: string, css: string, config: ImpressMeConfig): string =>
  compileFile(resolvePath(template))({
    ...config,
    title: config.title || 'Impress Slides',
    js,
    css,
    marked: html
  });
