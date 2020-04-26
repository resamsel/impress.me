import {Renderer, rendererMap} from './renderer';
import {toDataUri} from '../helpers';
import {RendererOptions} from './renderer-options';
import {debug} from 'loglevel';

const Viz = require('viz.js');
const {Module, render} = require('viz.js/full.render.js');
const viz = new Viz({Module, render});

export class DotRenderer implements Renderer {
  render(code: string, lang: string, options: RendererOptions): Promise<string> {
    debug('render', lang, options);
    // create SVG
    return viz.renderString(code, {format: 'svg'})
      .then((graph: string) => Buffer.from(graph))
      // encode SVG as base64 data URI
      .then((graph: Buffer) => toDataUri(graph))
      // return img with data URI
      .then((dataUri: string) => `<img class="code rendered ${lang} ${options.class}" src="${dataUri}">`);
  }
}

rendererMap.dot = new DotRenderer();
