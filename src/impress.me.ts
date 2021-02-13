import {existsSync, promises} from 'fs';
import {
  insertCssVars,
  log,
  logInit,
  logStep,
  mergeCss,
  mergeJs,
  parseInput,
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
  ],
  jsFiles: [
    'impress.js/js/impress.js',
    'js/navigation-ui-icons.js',
  ],
  primary: 'default',
  secondary: 'default',
  theme: 'planet',
  shape: Shape.Circle,
  strategy: Strategy.Planet,
  transitionDuration: 0,

  positionStrategyFactory: new PositionStrategyFactory(),

  width: 1920,
  height: 1080,
  shapeSize: 1680,
  shapeOffset: 400,
  stepDistance: 1920 * 0.6,

  flattened: false,
  slide: {
    layout: 'default',
    primary: 'default',
    secondary: 'default',
  },
};

function extractTheme(themeName: string) {
  if (!(themeName in themeMap)) {
    throw new Error(`Theme "${themeName}" not found`);
  }

  return themeMap[themeName];
}

export class ImpressMe {
  private basePath = '.';

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly overrides: Partial<ImpressMeConfig> = {}) {
  }

  mergeConfigs(documentConfig: Partial<ImpressMeConfig>): ImpressMeConfig {
    return {
      ...defaultConfig,
      ...documentConfig,
      ...extractTheme(this.overrides.theme ?? documentConfig.theme ?? defaultConfig.theme),
      ...this.overrides,
      cssFiles: [
        ...defaultConfig.cssFiles,
        ...documentConfig?.cssFiles ?? [],
        ...this.overrides?.cssFiles ?? [],
      ].map(path => resolvePath(path, [this.basePath])),
      jsFiles: [
        ...defaultConfig.jsFiles,
        ...documentConfig?.jsFiles ?? [],
        ...this.overrides?.jsFiles ?? [],
      ].map(path => resolvePath(path, [this.basePath])),
      slide: {
        ...defaultConfig.slide,
        ...documentConfig?.slide ?? {},
        ...this.overrides?.slide ?? {},
      },
      basePath: this.basePath,
    };
  }

  async convert(input: string, output?: string): Promise<string> {
    logInit();

    const inputFile = [input, `${input}.md`].find(existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }

    this.basePath = dirname(inputFile);

    const outFile = output === undefined ? toOutputFilename(input) : output;

    log('Input/output prepared');
    const [data, documentConfig] = await parseInput(inputFile);
    const config = this.mergeConfigs(documentConfig ?? {});

    const [html, js, css] = await Promise.all([
      markdownToHtml(data, config).then(logStep('Markdown converted')),
      mergeJs(config.jsFiles).then(logStep('JavaScript files merged')),
      mergeCss(config.cssFiles, insertCssVars(config)).then(logStep('CSS files merged')),
    ]);

    const rendered = renderTemplate(config.template, html, js, css, config);
    log('Template rendered');

    await promises.writeFile(outFile, rendered);
    log(`Created "${outFile}" from "${inputFile}"`);

    return outFile;
  }
}
