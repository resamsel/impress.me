import {sqrtPosition} from "./sqrt.position";
import {impress_md} from "./impress.md";
import * as fs from "fs";
import * as log from "loglevel";
import {ImpressMeConfig} from "./config";
import {resolve_path} from "./helpers";

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
    const inputFile = [input, `${input}.md`].find(fs.existsSync);
    if (inputFile === undefined) {
      throw new Error('Input file not found: ' + input);
    }
    const outFile = output !== undefined
      ? output
      : `${input.replace(/\.[^/.]+$/, "")}.html`;

    impress_md(inputFile, {
      position: sqrtPosition(this.config),
      css_files: this.config.cssFiles,
      ...this.config
    })
      .then(function (html) {
        fs.writeFile(
          outFile,
          html,
          () => log.debug('Created ' + outFile + ' from ' + inputFile)
        );
      }, function (err) {
        log.error(err);
        throw new Error(err);
      });
  }
}
