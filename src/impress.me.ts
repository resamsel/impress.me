import {existsSync, promises} from 'fs';
import {
  logEnd,
  logInit,
  logStart,
  logStep,
  mergeCss,
  mergeJs,
  renderTemplate,
  replaceCssVars,
  resolvePath,
  toOutputFilename,
} from './helpers';
import {markdownToHtml} from './markdown';
import {themes} from './themes';
import {ImpressMeConfig} from './impress-me-config';
import {PositionStrategyFactory} from './position';

const defaultConfig: ImpressMeConfig = {
  template: 'templates/slides.pug',
  cssFiles: [
    'css/impress.me.css',
    'css/circle.shape.css',
    'css/rounded.shape.css',
    'css/colors.css',
    'css/newspaper.theme.css',
    'highlight.js/styles/monokai.css',
  ].map(resolvePath),
  jsFiles: [
    'impress.js/js/impress.js',
  ].map(resolvePath),
  primary: 'default',
  secondary: 'default',
  theme: themes.planet,
  shape: 'circle',
  strategy: 'planet',
  transitionDuration: 0,

  positionStrategyFactory: new PositionStrategyFactory(),

  width: 1920,
  height: 1080,
  shapeSize: 1680,
  shapeOffset: 400,
  stepDistance: 1920 * 0.6,
};

export class ImpressMe {
  private readonly config: ImpressMeConfig;

  constructor(readonly flags: Partial<ImpressMeConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...this.flags.theme,
      ...this.flags,
      cssFiles: [
        ...defaultConfig.cssFiles,
        ...this.flags.cssFiles || [],
      ],
      jsFiles: [
        ...defaultConfig.jsFiles,
        ...this.flags.jsFiles || [],
      ],
    };
  }

  convert(input: string, output?: string): Promise<void> {
    logInit();

    const inputFile = [input, `${input}.md`].find(existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }

    const outFile = output === undefined ? toOutputFilename(input) : output;

    logStart('Input/output prepared');
    return Promise.all([
      markdownToHtml(inputFile, this.config)
        .then(logStep('Markdown converted')),
      mergeJs(this.config.jsFiles)
        .then(logStep('JavaScript files merged')),
      mergeCss(this.config.cssFiles, replaceCssVars(this.config))
        .then(logStep('CSS files merged')),
    ])
      .then(([html, js, css]) => renderTemplate(this.config.template, html, js, css, this.config))
      .then(logStep('Template rendered'))
      .then(html => promises.writeFile(outFile, html))
      .then(logEnd(`Creating "${outFile}" from "${inputFile}"`));
  }
}
