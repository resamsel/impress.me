import * as path from 'path';
import * as fs from 'fs';
import {promises, readFileSync} from 'fs';
import * as CleanCss from 'clean-css';
import {compileFile} from 'pug';
import {ImpressMeConfig} from './impress-me-config';
import {SlideNode} from './slide-node';
import {debug} from 'loglevel';
import {minify} from 'uglify-es';
import * as sass from 'sass';

export const excludeSlideClasses = ['title', 'overview', 'background', 'end'];
export const attrPattern = /(.*\S)\s*(\[]\(|<a href=")([^"]*)(\)|"><\/a>)\s*/;
export const attrItemPattern = /([^=,]+)\s*=\s*([^=,]+)/g;
const modulePath = path.dirname(__dirname);

let startTimestamp = new Date().getTime();
let timestamp = startTimestamp;

export const logInit = (): void => {
  startTimestamp = new Date().getTime();
  timestamp = startTimestamp;
};

export const logStart = (message: string): void => {
  const now = new Date().getTime();
  debug(message + ' - took ' + (now - timestamp) + 'ms');
  timestamp = now;
};

export const logStep = (message: string): (<T>(input: T) => T) =>
  input => {
    const now = new Date().getTime();
    debug(message + ' - took ' + (now - timestamp) + 'ms');
    timestamp = now;
    return input;
  };

export const logEnd = (message: string): (() => void) =>
  () => {
    const now = new Date().getTime();
    debug(message + ' took ' + (now - startTimestamp) + 'ms');
  };

export const toOutputFilename = (input: string) => {
  return `${input.replace(/\.[^/.]+$/, '')}.html`;
};

export const resolvePath = (p: string): string => {
  return [
    modulePath + '/' + p,
    p,
    'node_modules/' + p,
    '../' + p,
  ].find(fs.existsSync) || p;
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
  for (const child of root.children) {
    index += 1;
    if (child === node) {
      return index;
    }
    for (const child2 of child.children) {
      index += 1;
      if (child2 === node) {
        return index;
      }
    }
  }

  return -1;
};

export const flattenNodes = (node: SlideNode): SlideNode[] => {
  return node.children.reduce(
    (acc, child) => [...acc, ...flattenNodes(child)],
    [node]
  );
};

export const includeSlide = (node: SlideNode): boolean =>
  excludeSlideClasses.find(cls => (node.classes || ['title']).includes(cls)) === undefined;

export const toDataUri = (file: string): string =>
  `data:image/png;base64,${readFileSync(file, 'base64')}`;

export const extractUri = (uri: string): string =>
  uri.replace(/^\s*(url\s*\(\s*)?['"]?([^\s'")]+)['"]?(\s*\))?\s*$/, '$2');

const cssPropertyValueToDataUri = (propertyName: string, propertyValue: string) => {
  if (propertyName === 'background-image') {
    if (!propertyValue.startsWith('data:') && !propertyValue.startsWith('url(data:') &&
      !propertyValue.startsWith('http:') && !propertyValue.startsWith('url(http:') &&
      !propertyValue.startsWith('https:') && !propertyValue.startsWith('url(https:')) {
      try {
        return 'url(' + toDataUri(extractUri(propertyValue)) + ')';
      } catch (error) {
        // ignore
      }
    }
  }
  return propertyValue;
};

const cleanCss = new CleanCss({
  level: {
    1: {
      transform: cssPropertyValueToDataUri,
    },
  },
});

export const insertCssVars = (config: ImpressMeConfig): ((css: string) => string) => {
  return (css: string) => `$transitionDuration: ${config.transitionDuration}ms;${css}`;
};

const sassRender = (data: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      const result = sass.renderSync({
        data,
        outputStyle: 'compressed',
        includePaths: [resolvePath('css')],
      });
      return resolve(result.css.toString('utf8'));
    } catch (error) {
      return reject(error);
    }
  });
};

export const mergeCss = (cssFiles: string[], preProcess: (css: string) => string) =>
  Promise.all(
    cssFiles.map(file => promises.readFile(file, {encoding: 'utf8'})))
    .then(outputs => outputs.join('\n'))
    .then(preProcess)
    .then(sassRender)
    .then((data: string) => cleanCss.minify(data).styles);

export const mergeJs = (jsFiles: string[]) =>
  Promise.all(
    jsFiles.map(file => promises.readFile(file, 'utf8')
      .then(logStep(`JavaScript file read: "${file}"`))
      .then((data: string) => minify(data).code)
      .then(logStep(`JavaScript file minified: "${file}"`))
    ))
    .then(outputs => outputs.join(';'));

// eslint-disable-next-line max-params
export const renderTemplate = (template: string, html: string, js: string, css: string, config: ImpressMeConfig): string => {
  return compileFile(resolvePath(template))({
    title: 'Impress.me Slides',
    ...config,
    js,
    css,
    marked: html,
  });
};
