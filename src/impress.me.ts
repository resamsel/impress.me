import {PlanetPositionStrategy} from "./planet-position.strategy";
import {impress_md} from "./impress.md";
import {debug, error} from "loglevel";
import {ImpressMeConfig} from "./config";
import {existsSync, writeFile} from "fs";

const circleSize = 1680;
const defaultConfig: ImpressMeConfig = {
  width: 1920,
  height: 1080,
  offset: {
    top: 800,
    left: 450
  },
  circleSize,
  circleOffset: 400,
  stepDistance: circleSize * 0.25,
  primary: 'default',
  secondary: 'default',
  cssFiles: [],
  slideShape: 'circle',
  transitionDuration: 0
};

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
      positionStrategy: new PlanetPositionStrategy(this.config),
      css_files: this.config.cssFiles,
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
