import {PositionStrategy} from './position';
import {error, warn} from 'loglevel';
import {attrItemPattern, attrPattern, fileToDataUri, logStep, resolvePath, urlToDataUri} from './helpers';
import {existsSync} from 'fs';
import * as marked from 'marked';
import {Slugger} from 'marked';
import {highlightAuto} from 'highlight.js';
import {ImpressMeConfig} from './impress-me-config';
import {SlideNode} from './slide-node';
import {SlideNodeState} from './slide-node-state';
import {Transformation} from './transformation';
import {rendererMap} from './renderers';
import {SlideConfig} from './slide-config';
import Heading = marked.Tokens.Heading;

const specialLayoutSlideClasses = ['title', 'overview', 'end'];

const appendHeadingAttributes = (text: string, attrs: Record<string, string>, config: SlideConfig): void => {
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

  const classes = attrs.class.split(' ');
  if (specialLayoutSlideClasses.find(cls => classes.includes(cls)) === undefined &&
    classes.find(cls => cls.startsWith('focus') || cls.startsWith('grid')) === undefined) {
    // no layout classes have been set, yet - use the slide config
    attrs.class += ` ${config.layout}`;
  }

  if (config.primary !== 'default' && classes.find(cls => cls.includes('primary-')) === undefined) {
    attrs.class += ` primary-${config.primary}`;
  }

  if (config.secondary !== 'default' && classes.find(cls => cls.includes('secondary-')) === undefined) {
    attrs.class += ` secondary-${config.secondary}`;
  }
};

export const generateState = (headings: marked.Tokens.Heading[], positionStrategy: PositionStrategy, config: ImpressMeConfig): SlideNodeState => {
  const outerState = headings.reduce((state: SlideNodeState, curr: Heading) => {
    const root = state.root;
    const isRootNode = Object.keys(state.nodes).length === 0;
    const depth = isRootNode ? 1 : (config.hasInlineConfig ? curr.depth + 1 : curr.depth);
    const node: SlideNode = {
      ...curr,
      children: [],
      attrs: {
        class: `step slide depth-${depth}`,
      },
      depth,
    };

    state.nodes[curr.text] = node;

    if (isRootNode) {
      node.attrs.class += ' screen title';
    }

    appendHeadingAttributes(curr.text, node.attrs, config.slide);

    node.classes = node.attrs.class.split(' ');

    specialLayoutSlideClasses.forEach(id => {
      if (node.classes!.includes(id) && !node.attrs.id) {
        node.attrs.id = id;
      }
    });

    if (isRootNode) {
      return {
        ...state,
        root: node,
      };
    }

    let parent;
    switch (depth) {
      case 2:
        node.parent = root;
        root.children.push(node);
        break;
      case 3:
        if (root.children.length === 0) {
          throw new Error('Unexpected third level heading: ' + node.text);
        }

        parent = root.children[root.children.length - 1];
        node.parent = parent;
        parent.children.push(node);
        break;
      default:
        break;
    }

    return state;
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
      warn('Node not found', nodeKey, Object.keys(state.nodes));
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

    if (level === 1 && !config.hasInlineConfig) {
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
    html += '<' + h + ' class="heading">' + text + '</' + h + '>';
    return html;
  };
};

const processImage = (basePath: string): ((href: string, title: string, text: string) => string) =>
  (href: string, title: string, text: string) => {
    if (href === null) {
      return text;
    }

    if (href.startsWith('https://') || href.startsWith('http://')) {
      href = urlToDataUri(href);
    } else {
      const imageSrc = [href, basePath + '/' + href, resolvePath(href)].find(existsSync);
      if (imageSrc !== undefined) {
        href = fileToDataUri(imageSrc);
      }
    }
    let out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>';
    return out;
  };

const processHighlight = (code: string, paramString: string, callback: (err: any | undefined, code?: string) => void): string | void => {
  const params = paramString.split(',');
  const lang = params[0];
  if (params.includes('render')) {
    if (rendererMap[lang] !== undefined) {
      const options = params.slice(2).reduce((opts, curr) => {
        const [key, value] = curr.split('=');
        return {
          ...opts,
          [key]: value,
        };
      }, {});
      rendererMap[lang].render(code, lang, options)
        .then(rendered => callback(undefined, rendered))
        .catch(err => { // eslint-disable-line unicorn/catch-error-name
          error('Error while rendering code block', err);
          callback(err);
        });
      return;
    }

    warn('No renderer for language ' + lang + ' found.');
  }

  callback(undefined, highlightAuto(code, [lang]).value);
};

export const markdownToHtml = (md: string, config: ImpressMeConfig): Promise<string> => {
  return Promise.resolve(md)
    .then<[string, SlideNodeState], never>(md => {
      const tokens = marked.lexer(md);
      const headings = tokens.filter(token => token.type === 'heading') as Heading[];
      const positionStrategy = config.positionStrategyFactory.create(config);
      const state: SlideNodeState = generateState(headings, positionStrategy, config);
      const cleanedMarkdown = tokens.filter(token => 'raw' in token).map(token => (token as any).raw).join('');

      return [cleanedMarkdown, state];
    })
    .then(logStep('Node state generated'))
    .then(([md, state]) => {
      const renderer = new marked.Renderer();
      renderer.heading = processHeading(state, config);
      renderer.image = processImage(config.basePath);
      const paragraph = renderer.paragraph;
      renderer.paragraph = (text: string) => {
        if (text.startsWith('<img src="') || text.startsWith('<a href="')) {
          // omit wrapping paragraph when it starts with an image or a link
          return text;
        }

        return paragraph(text);
      };
      const codeFn = renderer.code;
      renderer.code = (code: string, language: string | undefined, isEscaped: boolean): string => {
        if (language?.split(',').includes('render')) {
          return code;
        }
        return codeFn.bind(renderer)(code, language, isEscaped);
      };

      return new Promise((resolve, reject) => {
        marked(
          md,
          {
            gfm: true,
            breaks: false,
            pedantic: false,
            smartLists: true,
            smartypants: false,
            renderer,
            langPrefix: 'hljs ',
            highlight: processHighlight,
          },
          (err, content) => {
            if (err) {
              return reject(err);
            }
            if (state.isOpen) {
              content += '</div>';
            }
            resolve(content);
          },
        );
      });
    });
};
