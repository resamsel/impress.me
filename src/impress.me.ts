import {existsSync, promises} from 'fs';
import {
  insertCssVars,
  logEnd,
  logInit,
  logStart,
  logStep,
  mergeCss,
  mergeJs,
  renderTemplate,
  resolvePath,
  toOutputFilename,
} from './helpers';
import {markdownToHtml} from './markdown';
import {ImpressMeConfig} from './impress-me-config';
import {PositionStrategyFactory} from './position';
import {Strategy} from './strategy';
import {Shape} from './shape';
import {themeMap} from './theme';
import {dirname} from 'path';

export const defaultConfig: ImpressMeConfig = {
  basePath: '.',
  template: 'templates/slides.pug',
  cssFiles: [
    'css/impress.me.scss',
    'highlight.js/styles/monokai.css',
  ].map(resolvePath),
  jsFiles: [
    'impress.js/js/impress.js',
    'js/navigation-ui-icons.js',
  ].map(resolvePath),
  primary: 'default',
  secondary: 'default',
  theme: themeMap.planet,
  shape: Shape.Circle,
  strategy: Strategy.Planet,
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

  constructor(readonly overrides: Partial<ImpressMeConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...this.overrides.theme,
      ...this.overrides,
      cssFiles: [
        ...defaultConfig.cssFiles,
        ...this.overrides.cssFiles || [],
      ],
      jsFiles: [
        ...defaultConfig.jsFiles,
        ...this.overrides.jsFiles || [],
      ],
    };
  }

  convert(input: string, output?: string): Promise<void> {
    logInit();

    const inputFile = [input, `${input}.md`].find(existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }

    this.config.basePath = dirname(inputFile);

    const outFile = output === undefined ? toOutputFilename(input) : output;

    logStart('Input/output prepared');
    return Promise.all([
      markdownToHtml(inputFile, this.config)
        .then(logStep('Markdown converted')),
      mergeJs(this.config.jsFiles)
        .then(logStep('JavaScript files merged')),
      mergeCss(this.config.cssFiles, insertCssVars(this.config))
        .then(logStep('CSS files merged')),
    ])
      .then(([html, js, css]) => renderTemplate(this.config.template, html, js, css, this.config))
      .then(logStep('Template rendered'))
      .then(html => promises.writeFile(outFile, html))
      .then(logEnd(`Creating "${outFile}" from "${inputFile}"`));
  }
}
