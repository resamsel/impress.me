import {PlanetPositionStrategy} from "./planet-position.strategy";
import {impress_md} from "./impress.md";
import {debug, error} from "loglevel";
import {ImpressMeConfig} from "./config";
import {existsSync, writeFile} from "fs";
import {LinearPositionStrategy} from "./linear-position.strategy";
import {PositionStrategy} from "./position.strategy";

const shapeSize = 1680;
const defaultConfig: ImpressMeConfig = {
  width: 1920,
  height: 1080,
  offset: {
    x: -1920 / 2 + 450,
    y: -1080 / 2 + 800,
    z: 0,
    scale: 1
  },
  shapeSize,
  shapeOffset: 400,
  stepDistance: 1920 * 0.6,
  primary: 'default',
  secondary: 'default',
  cssFiles: [],
  shape: 'circle',
  strategy: 'planet',
  transitionDuration: 0
};

function createPositionStrategy(config: ImpressMeConfig): PositionStrategy {
  switch (config.strategy) {
    case 'linear':
      return new LinearPositionStrategy(config);
    case 'planet':
    default:
      return new PlanetPositionStrategy(config);
  }
}

export class ImpressMe {
  private readonly config: ImpressMeConfig = {
    ...defaultConfig,
    ...this.flags
  };

  constructor(private readonly flags: Partial<ImpressMeConfig> = {}) {
  }

  convert(input: string, output?: string): void {
    const inputFile = [input, `${input}.md`].find(existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }
    const outFile = output !== undefined
      ? output
      : `${input.replace(/\.[^/.]+$/, "")}.html`;

    impress_md(inputFile, {
      positionStrategy: createPositionStrategy(this.config),
      css_files: this.config.cssFiles,
      js_files: [],
      ...this.config
    })
      .then(function (html) {
        writeFile(
          outFile,
          html,
          () => debug('Created ' + outFile + ' from ' + inputFile)
        );
      }, function (err) {
        error(err);
        throw new Error(err);
      });
  }
}
