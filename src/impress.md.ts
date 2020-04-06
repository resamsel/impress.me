import {SlideNode} from "./config";
import * as marked from "marked";
import * as CleanCss from "clean-css";
import {highlightAuto} from 'highlight.js';
import {resolve_path} from './helpers';
import {PositionStrategy} from "./position.strategy";
import {LinearPositionStrategy} from "./linear-position.strategy";
import {existsSync, readFileSync} from "fs";
import {compileFile} from "pug";
import {minify} from "uglify-es";
import Heading = marked.Tokens.Heading;
import {debug} from 'loglevel';

var js_files = ['impress.js/js/impress.js'];
var css_files = [
  'css/impress.me.css',
  'css/circle.shape.css',
  'css/rounded.shape.css',
  'css/themes.css',
  'highlight.js/styles/monokai.css'
];

js_files = js_files.map(resolve_path);

css_files = css_files.map(resolve_path);

var attr_pattern = /(.*\S)\s*\[]\(([^"]*)\)\s*/;
var attr_item_pattern = /([^=,]+)\s*=\s*([^=,]+)/g;
var html_template_file = resolve_path('templates/slides.pug');
var htmlPug = compileFile(html_template_file);

interface ImpressMdConfig {
  title?: string;
  css_files: string[];
  js_files: string[];
  marked?: any;
  primary: string;
  secondary: string;
  slideShape: string;
  transitionDuration: number;

  positionStrategy: PositionStrategy;
}

export function impress_md(file: string, inOptions: Partial<ImpressMdConfig>) {
  const md = readFileSync(file).toString();
  const tokens = marked.lexer(md);
  const headings = tokens.filter(token => token.type === 'heading') as Heading[];
  const nodes: Record<string, SlideNode> = {};

  headings.reduce((root: SlideNode, curr: Heading) => {
    const node: SlideNode = {
      ...curr,
      children: []
    };

    nodes[curr.text] = node;

    switch (curr.depth) {
      case 1:
        return ({
          ...root,
          ...node
        });
      case 2:
        node.parent = root;
        root.children.push(node);
        return root;
      case 3:
        const parent = root.children[root.children.length - 1];
        node.parent = parent;
        parent.children.push(node);
        return root;
    }

    return root;
  }, {} as SlideNode);

  var renderer = new marked.Renderer();
  var is_open = false;
  var steps = 0;
  var cleanCss = new CleanCss();

  const options: ImpressMdConfig = {
    js_files: [],
    css_files: [],
    primary: 'default',
    secondary: 'default',
    slideShape: 'circle',
    transitionDuration: 1000,
    positionStrategy: new LinearPositionStrategy(),
    ...inOptions
  };

  renderer.heading = function (text, level) {
    var html = '';
    var h = 'h' + level;
    var match;
    const node = nodes[text];
    if (node === undefined) {
      debug('Node not found', text, Object.keys(nodes));
    }

    if (node === undefined || level > 3) {
      return '<' + h + '>' + text + '</' + h + '>';
    }
    if (is_open === true) {
      html += '</div>';
    }
    steps += 1;
    match = attr_pattern.exec(text);
    const attrs: { [key: string]: string | number } = {
      'class': "step slide depth-" + level
    };
    if (match) {
      text = match[1];
      var attr_text = match[2];
      while (match = attr_item_pattern.exec(attr_text)) {
        var key = match[1].trim();
        var value = match[2].trim();
        if (key == 'class' || key == 'id' || key == 'style') {
          attrs['class'] += ' ' + value
        } else {
          attrs['data-' + key] = value;
        }
      }
    }

    const pos = options.positionStrategy.calculate(node);
    node.pos = pos;

    if (level === 1) {
      attrs['class'] += ' screen title';
      options.title = options.title || text;
    }
    if (!attrs['data-x']) {
      attrs['data-x'] = pos.x;
    }
    if (!attrs['data-y']) {
      attrs['data-y'] = pos.y;
    }
    if (!attrs['data-z']) {
      attrs['data-z'] = pos.z;
    }
    if (!attrs['data-scale']) {
      attrs['data-scale'] = pos.scale;
    }
    var attr_list = [];
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k)) {
        attr_list.push(k + '="' + attrs[k] + '"');
      }
    }
    html += '<div ' + attr_list.join(' ') + '>';
    is_open = true;
    html += '<' + h + '>' + text + '</' + h + '>';
    return html;
  };

  renderer.image = function (href, title, text) {
    if (href === null) {
      return text;
    }

    const imageSrc = [href, resolve_path(href)].find(existsSync);
    if (imageSrc !== undefined) {
      const data = readFileSync(imageSrc, 'base64');
      href = `data:image/png;base64,${data}`;
    }
    let out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>';
    return out;
  };

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
    ...options.marked,
    renderer: renderer,
    langPrefix: 'hljs ',
    highlight: function (code: string, lang: string) {
      return highlightAuto(code, [lang]).value;
    }
  });

  var js = js_files.concat(options.js_files).map(function (file) {
    return minify(readFileSync(file, 'utf8').toString()).code;
  }).join(";");

  var marked_html = marked(md);

  if (is_open) {
    marked_html += '</div>'
  }

  return Promise.all(css_files.concat(options.css_files).map(function (file) {
    return new Promise(function (resolve, reject) {
      cleanCss.minify(readFileSync(file), function (err: any, css: any) {
        if (err) return reject(err);
        return resolve(css.styles);
      });
    });
  })).then(function (css_list) {
    return htmlPug({
      js: js,
      css: css_list.join("\n"),
      title: options.title || 'Impress Slides',
      marked: marked_html,
      primary: options.primary,
      secondary: options.secondary,
      slideShape: options.slideShape,
      transitionDuration: options.transitionDuration
    })
  });
}
