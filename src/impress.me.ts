import {ImpressMeConfig} from "./config";
import {existsSync, promises} from "fs";
import {minifyCss, minifyJs, renderTemplate, resolvePath} from "./helpers";
import {markdownToHtml} from "./markdown";
import {debug} from 'loglevel';

const defaultConfig: ImpressMeConfig = {
  template: 'templates/slides.pug',
  cssFiles: [
    'css/impress.me.css',
    'css/circle.shape.css',
    'css/rounded.shape.css',
    'css/themes.css',
    'highlight.js/styles/monokai.css'
  ].map(resolvePath),
  jsFiles: [
    'impress.js/js/impress.js'
  ].map(resolvePath),
  primary: 'default',
  secondary: 'default',
  shape: 'circle',
  strategy: 'planet',
  transitionDuration: 0,

  width: 1920,
  height: 1080,
  shapeSize: 1680,
  shapeOffset: 400,
  stepDistance: 1920 * 0.6
};

export class ImpressMe {
  private readonly config: ImpressMeConfig = {
    ...defaultConfig,
    ...this.flags
  };

  constructor(private readonly flags: Partial<ImpressMeConfig> = {}) {
  }

  convert(input: string, output?: string): Promise<void> {
    const inputFile = [input, `${input}.md`].find(existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }
    const outFile = output !== undefined
      ? output
      : `${input.replace(/\.[^/.]+$/, "")}.html`;

    return Promise.all([
      markdownToHtml(inputFile, this.config),
      minifyJs(this.config.jsFiles),
      minifyCss(this.config.cssFiles)
    ])
      .then(([html, js, css]) => renderTemplate(this.config.template, html, js, css, this.config))
      .then(html => promises.writeFile(outFile, html))
      .then(() => debug(`Created ${outFile} from ${inputFile}`));
  }
}
