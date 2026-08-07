import {PositionStrategy} from './position';
import {error, warn} from 'loglevel';
import {attrItemPattern, attrPattern, fileToDataUri, logStep, resolvePath, urlToDataUri} from './helpers';
import {existsSync} from 'fs';
import {Marked, marked} from 'marked';
import type {Tokens} from 'marked';
import hljs from 'highlight.js';
import {ImpressMeConfig} from './impress-me-config';
import {SlideNode} from './slide-node';
import {SlideNodeState} from './slide-node-state';
import {Transformation} from './transformation';
import {rendererMap} from './renderers';
import {SlideConfig} from './slide-config';

type Heading = Tokens.Heading;

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
    attrs.class += ` ${config.layout}`;
  }

  if (config.primary !== 'default' && classes.find(cls => cls.includes('primary-')) === undefined) {
    attrs.class += ` primary-${config.primary}`;
  }

  if (config.secondary !== 'default' && classes.find(cls => cls.includes('secondary-')) === undefined) {
    attrs.class += ` secondary-${config.secondary}`;
  }
};

export const generateState = (headings: Tokens.Heading[], positionStrategy: PositionStrategy, config: ImpressMeConfig): SlideNodeState => {
  const outerState = headings.reduce((state: SlideNodeState, curr: Heading) => {
    const root = state.root;
    const isRootNode = Object.keys(state.nodes).length === 0;
    const depth = isRootNode ? 1 : (config.flattened ? curr.depth + 1 : curr.depth);
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
  return s.replace(/([-]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
}

function makeSlugger() {
  const slugCounts = new Map<string, number>();
  return function slugify(text: string): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    const clean = cleanEmoji(base);
    const count = slugCounts.get(clean) ?? 0;
    slugCounts.set(clean, count + 1);
    return count === 0 ? clean : `${clean}-${count}`;
  };
}

export const markdownToHtml = (md: string, config: ImpressMeConfig): Promise<string> => {
  return Promise.resolve(md)
    .then<[string, SlideNodeState], never>(md => {
      const tokens = marked.lexer(md);
      const headings = tokens.filter(token => 'type' in token && token.type === 'heading') as Heading[];
      const positionStrategy = config.positionStrategyFactory.create(config);
      const state: SlideNodeState = generateState(headings, positionStrategy, config);
      const cleanedMarkdown = tokens.filter(token => 'raw' in token).map(token => (token as any).raw).join('');

      return [cleanedMarkdown, state];
    })
    .then(logStep('Node state generated'))
    .then(([md, state]) => {
      const slugger = makeSlugger();

      const markedInstance = new Marked();
      markedInstance.use({
        async: true,
        renderer: {
          heading(token: Tokens.Heading): string {
            const {text: rawText, depth} = token;
            const h = 'h' + depth;
            const node = state.nodes[rawText];
            if (node === undefined) {
              warn('Node not found', rawText, Object.keys(state.nodes));
            }

            const renderedText = this.parser.parseInline(token.tokens);

            if (node === undefined || depth > 3) {
              return '<' + h + '>' + renderedText + '</' + h + '>';
            }

            let html = '';
            if (state.isOpen) {
              html += '</div>';
            }

            const match = attrPattern.exec(renderedText);
            const displayText = match ? match[1] : renderedText;

            if (depth === 1 && !config.flattened) {
              config.title = config.title || displayText;
            }

            const slug = cleanEmoji(slugger(displayText.replace(/<[^>]+>/g, '')));
            if (node.attrs.id === undefined) {
              node.attrs.id = slug;
            }

            const attrList = Object.keys(node.attrs)
              .filter(key => node.attrs[key] !== undefined)
              .map(key => `${key}="${node.attrs[key]}"`);
            html += '<div ' + attrList.join(' ') + '>';
            state.isOpen = true;
            html += '<' + h + ' class="heading">' + displayText + '</' + h + '>';
            return html;
          },

          image(token: Tokens.Image): string {
            let {href, title, text} = token;
            if (!href) {
              return text;
            }

            if (href.startsWith('https://') || href.startsWith('http://')) {
              href = urlToDataUri(href);
            } else {
              const imageSrc = [href, config.basePath + '/' + href, resolvePath(href)].find(existsSync);
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
          },

          paragraph(token: Tokens.Paragraph): string {
            const text = this.parser.parseInline(token.tokens);
            if (text.startsWith('<img src="') || text.startsWith('<a href="')) {
              return text + '\n';
            }
            return `<p>${text}</p>\n`;
          },

          code(token: Tokens.Code): string {
            const {text, lang} = token;
            if (lang?.split(',').includes('render')) {
              return text;
            }
            const language = lang?.split(',')[0];
            const highlighted = language
              ? hljs.highlight(text, {language, ignoreIllegals: true}).value
              : hljs.highlightAuto(text).value;
            const langClass = language ? 'language-' + language : '';
            return `<pre><code class="hljs ${langClass}">${highlighted}</code></pre>\n`;
          },
        },

        walkTokens: async (token) => {
          if (token.type === 'code') {
            const params = (token.lang ?? '').split(',');
            if (params.includes('render')) {
              const lang = params[0];
              if (rendererMap[lang] !== undefined) {
                const options = params.slice(2).reduce((opts: Record<string, string>, curr: string) => {
                  const [key, value] = curr.split('=');
                  return {...opts, [key]: value};
                }, {});
                try {
                  token.text = await rendererMap[lang].render(token.text, lang, options);
                } catch (err) {
                  error('Error while rendering code block', err);
                }
              } else {
                warn('No renderer for language ' + lang + ' found.');
              }
            }
          }
        },
      });

      return (markedInstance.parse(md, {async: true}) as Promise<string>)
        .then(html => {
          if (state.isOpen) {
            return html + '</div>';
          }
          return html;
        });
    });
};
