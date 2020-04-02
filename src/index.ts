import {Command, flags} from '@oclif/command'
import {ImpressMe} from "./impress.me";

class ImpressMeCommand extends Command {
  static description = 'create impress.js presentations from markdown documents in style';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    cssFiles: flags.string({
      char: 'c',
      description: 'the CSS files to add - add multiple files by adding this option multiple times',
      multiple: true
    }),
    transitionDuration: flags.integer({
      char: 't',
      description: 'the duration between slides in millis'
    })
  };

  static args = [
    {name: 'input', required: true},
    {name: 'output'}
  ];

  async run() {
    const {args, flags} = this.parse(ImpressMeCommand);

    const impressMe = new ImpressMe(flags);

    impressMe.convert(args.input, args.output);
  }
}

export = ImpressMeCommand
