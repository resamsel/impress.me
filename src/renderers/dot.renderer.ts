import {Renderer, rendererMap} from './renderer';
import {RendererOptions} from './renderer-options';

const Viz = require('viz.js');
const {Module, render} = require('viz.js/full.render.js');
const viz = new Viz({Module, render});

export class DotRenderer implements Renderer {
  render(code: string, lang: string, options: RendererOptions): Promise<string> {
    options = {
      class: '',
      ...options,
    };

    // create SVG
    return viz.renderString(code, {format: 'svg'})
      // .then((svg: string) => `<div class="code rendered ${lang} ${options.class}">${svg}</div>`);
      .then((svg: string) => svg.replace('<svg ', `<svg class="code rendered ${lang} ${options.class}" `));
  }
}

rendererMap.dot = new DotRenderer();
