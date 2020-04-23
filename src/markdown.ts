import {PositionStrategy} from './position';
import {debug} from 'loglevel';
import {attrItemPattern, attrPattern, logStep, resolvePath, toDataUri} from './helpers';
import {existsSync, promises} from 'fs';
import * as marked from 'marked';
import {Slugger} from 'marked';
import {highlightAuto} from 'highlight.js';
import {ImpressMeConfig} from './impress-me-config';
import {SlideNode} from './slide-node';
import {SlideNodeState} from './slide-node-state';
import {Transformation} from './transformation';
import Heading = marked.Tokens.Heading;

const appendHeadingAttributes = (text: string, attrs: Record<string, string>): void => {
  let match = attrPattern.exec(text);
  if (match) {
    const attrText = match[3];
    while ((match = attrItemPattern.exec(attrText))) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key === 'class' || key === 'id' || key === 'style') {
        attrs.class += ' ' + value;
      } else {
        attrs['data-' + key] = value;
      }
    }
  }
};

const generateState = (headings: marked.Tokens.Heading[], positionStrategy: PositionStrategy): SlideNodeState => {
  const outerState = headings.reduce((state: SlideNodeState, curr: Heading) => {
    const root = state.root;
    const node: SlideNode = {
      ...curr,
      children: [],
      attrs: {
        class: 'step slide depth-' + curr.depth,
      },
    };

    state.nodes[curr.text] = node;

    appendHeadingAttributes(curr.text, node.attrs);

    if (node.depth === 1) {
      node.attrs.class += ' screen title';
    }
    node.classes = node.attrs.class.split(' ');

    ['title', 'overview', 'end'].forEach(id => {
      if (node.classes!.includes(id) && !node.attrs.id) {
        node.attrs.id = id;
      }
    });

    let parent;
    switch (curr.depth) {
      case 1:
        return {
          ...state,
          root: node,
        };
      case 2:
        node.parent = root;
        root.children.push(node);
        return {
          ...state,
          root,
        };
      case 3:
        parent = root.children[root.children.length - 1];
        node.parent = parent;
        parent.children.push(node);
        return {
          ...state,
          root,
        };
      default:
        return state;
    }
  }, {root: {}, nodes: {}, isOpen: false} as SlideNodeState);

  Object.keys(outerState.nodes).forEach(key => {
    const node = outerState.nodes[key];
    const pos = positionStrategy.calculate(node);

    node.pos = pos;

    const posKeys: (keyof Transformation)[] = ['x', 'y', 'z', 'scale', 'rotate', 'rotate-x', 'rotate-y'];
    posKeys.forEach(k => {
      const value = parseFloat(node.attrs['data-' + k]);
      if (isNaN(value)) {
        if (pos[k] !== undefined) {
          node.attrs['data-' + k] = String(pos[k]);
        }
      } else {
        pos[k] = value;
      }
    });
  });

  return outerState;
};

function cleanEmoji(s: string) {
  return s.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
}

const processHeading = (state: SlideNodeState, config: ImpressMeConfig):
  ((text: string, level: number, raw: string, slugger: Slugger) => string) => {
  return (text: string, level: number, raw: string, slugger: Slugger) => {
    const h = 'h' + level;
    const nodeKey = text
      .replace('<a href="', '[](')
      .replace('"></a>', ')');
    const node = state.nodes[nodeKey];
    if (node === undefined) {
      debug('Node not found', nodeKey, Object.keys(state.nodes));
    }

    if (node === undefined || level > 3) {
      return '<' + h + '>' + text + '</' + h + '>';
    }

    let html = '';
    if (state.isOpen) {
      html += '</div>';
    }
    const match = attrPattern.exec(text);
    if (match) {
      text = match[1];
    }

    if (level === 1) {
      config.title = config.title || text;
    }

    const slug = cleanEmoji(slugger.slug(text));
    if (node.attrs.id === undefined) {
      node.attrs.id = slug;
    }

    const attrList = Object.keys(node.attrs)
      .filter(key => node.attrs[key] !== undefined)
      .map(key => `${key}="${node.attrs[key]}"`);
    html += '<div ' + attrList.join(' ') + '>';
    state.isOpen = true;
    html += '<' + h + '>' + text + '</' + h + '>';
    return html;
  };
};

const processImage = (config: ImpressMeConfig): ((href: string, title: string, text: string) => string) =>
  (href: string, title: string, text: string) => {
    if (href === null) {
      return text;
    }

    const imageSrc = [href, config.basePath + '/' + href, resolvePath(href)].find(existsSync);
    if (imageSrc !== undefined) {
      href = toDataUri(imageSrc);
    }
    let out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>';
    return out;
  };

export const markdownToHtml = (file: string, config: ImpressMeConfig): Promise<string> => {
  return promises.readFile(file, 'utf8')
    .then(logStep(`Markdown file "${file}" read`))
    .then<[string, SlideNodeState], never>(md => {
      const tokens = marked.lexer(md);
      const headings = tokens.filter(token => token.type === 'heading') as Heading[];
      const positionStrategy = config.positionStrategyFactory.create(config);
      const state: SlideNodeState = generateState(headings, positionStrategy);

      return [md, state];
    })
    .then(logStep('Node state generated'))
    .then(([md, state]) => {
      const renderer = new marked.Renderer();
      renderer.heading = processHeading(state, config);
      renderer.image = processImage(config);
      const paragraph = renderer.paragraph;
      renderer.paragraph = (text: string) => {
        if (text.startsWith('<img src="') || text.startsWith('<a href="')) {
          // omit wrapping paragraph when it starts with an image or a link
          return text;
        }

        return paragraph(text);
      };

      marked.setOptions({
        gfm: true,
        breaks: false,
        pedantic: false,
        smartLists: true,
        smartypants: false,
        renderer,
        langPrefix: 'hljs ',
        highlight: (code: string, lang: string) => highlightAuto(code, [lang]).value,
      });

      let markedHtml = marked(md);

      if (state.isOpen) {
        markedHtml += '</div>';
      }
      return markedHtml;
    });
};
