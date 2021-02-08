import {Command, flags} from '@oclif/command';
import {ImpressMe} from './impress.me';
import * as log from 'loglevel';
import {handle} from '@oclif/errors';
import {themeMap} from './theme';
import {strategies, Strategy} from './strategy';
import {Shape, shapes} from './shape';
import * as open from 'open';

class ImpressMeCommand extends Command {
  static description = 'create impress.js presentations from markdown documents in style';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    primary: flags.string({
      char: 'p',
      description: 'define the primary color from material colors',
    }),
    secondary: flags.string({
      char: 's',
      description: 'define the secondary color from material colors',
    }),
    theme: flags.option({
      char: 't',
      description: 'choose the theme for the presentation (shape and strategy)',
      options: Object.keys(themeMap),
      parse: x => x,
    }),
    shape: flags.option({
      description: 'define the shape of the slides',
      options: shapes,
      parse: x => x as Shape,
    }),
    strategy: flags.option({
      description: 'define the slide positioning strategy',
      options: strategies,
      parse: x => x as Strategy,
    }),
    cssFiles: flags.string({
      char: 'c',
      description: 'the CSS files to add - add multiple files by adding this option multiple times',
      multiple: true,
    }),
    transitionDuration: flags.integer({
      char: 'd',
      description: 'the duration between slides in millis',
    }),
    debug: flags.boolean({
      description: 'enable debug logging',
    }),
    open: flags.boolean({
      char: 'o',
      description: 'open created document',
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

    await new ImpressMe(parsed.flags)
      .convert(parsed.args.input, parsed.args.output)
      .then(output => {
        if (parsed.flags.open) {
          log.debug(`Opening "${output}"`);
          open(output);
        }
      })
      .catch(handle);
  }
}

export = ImpressMeCommand;
