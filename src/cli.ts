import {Command, flags} from '@oclif/command';
import {ImpressMe} from './impress.me';
import * as log from 'loglevel';
import {handle} from '@oclif/errors';
import {themes} from './themes';

class ImpressMeCommand extends Command {
  static description = 'create impress.js presentations from markdown documents in style';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    primary: flags.string({
      char: 'p',
      description: 'define the primary color from material colors',
      default: 'default',
    }),
    secondary: flags.string({
      char: 's',
      description: 'define the secondary color from material colors',
      default: 'default',
    }),
    theme: flags.option({
      char: 't',
      description: 'choose the theme for the presentation (shape and strategy)',
      options: Object.keys(themes),
      parse: x => x,
      default: 'planet',
    }),
    shape: flags.option({
      description: 'define the shape of the slides',
      options: ['circle', 'rounded', 'none'],
      parse: x => x,
    }),
    strategy: flags.option({
      description: 'define the slide positioning strategy',
      options: ['planet', 'linear', 'newspaper'],
      parse: x => x,
    }),
    cssFiles: flags.string({
      char: 'c',
      description: 'the CSS files to add - add multiple files by adding this option multiple times',
      multiple: true,
    }),
    transitionDuration: flags.integer({
      char: 'd',
      description: 'the duration between slides in millis',
      default: 1000,
    }),
    debug: flags.boolean({
      description: 'enable debug logging',
    }),
  };

  static args = [
    {name: 'input', required: true},
    {name: 'output'},
  ];

  async run() {
    const parsed = this.parse(ImpressMeCommand);

    if (parsed.flags.debug) {
      log.setLevel('debug');
    } else {
      log.setLevel('info');
    }

    await new ImpressMe({...parsed.flags, theme: themes[parsed.flags.theme as string]})
      .convert(parsed.args.input, parsed.args.output)
      .catch(handle);
  }
}

export = ImpressMeCommand;
