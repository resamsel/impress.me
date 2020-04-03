import {ImpressMdState, SlideNode, SlidePosition} from "./config";
import * as path from "path";
import * as fs from "fs";
import * as jade from "jade";
import * as marked from "marked";
import * as UglifyJs from "uglify-es";
import * as CleanCss from "clean-css";
import {highlightAuto} from 'highlight.js';

var js_files = ['impress.js/js/impress.js'];
var css_files = [
  'css/impress.me.css',
  'highlight.js/styles/monokai.css'
];
var module_path = path.dirname(__dirname);

function resolve_path(path: string): string {
  return [
    path,
    module_path + '/' + path,
    'node_modules/' + path,
    '../' + path
  ].find(fs.existsSync) || path;
}

js_files = js_files.map(resolve_path);

css_files = css_files.map(resolve_path);

var attr_pattern = /(.*\S)\s*\[]\(([^"]*)\)\s*/;
var attr_item_pattern = /([^=,]+)\s*=\s*([^=,]+)/g;
var html_template_file = resolve_path('templates/slides.jade');
var html_jade = jade.compileFile(html_template_file);

interface ImpressMdConfig {
  title?: string;
  css_files: string[];
  js_files: string[];
  marked?: any;
  transitionDuration: number;

  position(steps: number, level: number, state: ImpressMdState): SlidePosition;
}

export function impress_md(file: string, inOptions: Partial<ImpressMdConfig>) {
  const md = fs.readFileSync(file).toString();
  // const tokens = marked.lexer(md);
  // const headings = tokens.filter(token => token.type === 'heading');
  // const tree = headings.reduce((root, curr) => {
  //     switch (curr.depth) {
  //         case 1:
  //             return ({
  //                 ...curr,
  //                 children: []
  //             });
  //         case 2:
  //             return ({
  //                 ...root,
  //                 children: [...root.children, {...curr, children: []}]
  //             });
  //         case 3:
  //             const parent = root.children[root.children.length - 1];
  //             parent.children = [...parent.children, {...curr, children: []}];
  //             return ({
  //                 ...root
  //             });
  //     }
  // }, {});

  var renderer = new marked.Renderer();
  var is_open = false;
  var steps = 0;
  var cleanCss = new CleanCss();
  const state: ImpressMdState = {
    root: {
      level: 1,
      children: []
    }
  };

  const options: ImpressMdConfig = {
    js_files: [],
    css_files: [],
    transitionDuration: 1000,
    position: function (step: number, level: number, state: ImpressMdState) {
      return {
        x: (step - 5) * 1000,
        y: 0,
        z: 0,
        scale: 1
      };
    },
    ...inOptions
  };

  renderer.heading = function (text, level) {
    var html = '';
    var h = 'h' + level;
    var match;
    if (level > 3) {
      return '<' + h + '>' + text + '</' + h + '>';
    }
    if (is_open === true) {
      html += '</div>';
    }
    steps += 1;
    match = attr_pattern.exec(text);
    const attrs: { [key: string]: string | number } = {'class': "step slide depth-" + level};
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
    const node: SlideNode = {
      level,
      children: []
    };
    if (state.current === undefined) {
      // root
      state.root = node;
    } else if (level > state.current.level) {
      // child of current
      node.parent = state.current;
    } else if (level === state.current.level) {
      // sibling of current
      node.parent = state.current.parent;
    } else if (level < state.current.level && state.current.parent !== undefined) {
      // new parent sibling of current
      node.parent = state.current.parent.parent;
    }
    if (node.parent !== undefined) {
      node.parent.children.push(node);
    }
    state.current = node;
    const pos = options.position(steps, level, state);
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

    const imageSrc = [href, resolve_path(href)].find(fs.existsSync);
    if (imageSrc !== undefined) {
      const data = fs.readFileSync(imageSrc, 'base64');
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
    return UglifyJs.minify(fs.readFileSync(file, 'utf8').toString()).code;
  }).join(";");

  var marked_html = marked(md);

  if (is_open) {
    marked_html += '</div>'
  }

  return Promise.all(css_files.concat(options.css_files).map(function (file) {
    return new Promise(function (resolve, reject) {
      cleanCss.minify(fs.readFileSync(file), function (err: any, css: any) {
        if (err) return reject(err);
        return resolve(css.styles);
      });
    });
  })).then(function (css_list) {
    return html_jade({
      js: js,
      css: css_list.join("\n"),
      title: options.title || 'Impress Slides',
      marked: marked_html,
      transitionDuration: options.transitionDuration
    })
  });
}
