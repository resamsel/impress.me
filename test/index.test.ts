import {expect, test} from '@oclif/test'

import cmd = require('../src');

describe('impress.me', () => {
  // test
  //   .stderr()
  //   .do(() => cmd.run([]))
  //   .it('runs impress.me', ctx => {
  //     expect(ctx.stderr).to.contain('Missing 1 required arg')
  //   });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md']))
    .it('runs impress.me Demo.md', ctx => {
      expect(ctx.stdout).to.contain('')
    });
});
