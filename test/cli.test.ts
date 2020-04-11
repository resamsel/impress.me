import {expect, test} from '@oclif/test'
import cmd = require('../src/cli');

describe('impress.me', () => {
  // test
  //   .stderr()
  //   .do(() => cmd.run([]))
  //   .it('runs impress.me', ctx => {
  //     expect(ctx.stderr).to.contain('Missing 1 required arg')
  //   });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--debug']))
    .it('runs impress.me Demo.md', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', 'out.html', '--debug']))
    .it('runs impress.me Demo.md out.html', ctx => {
      expect(ctx.stdout).to.contain('Creating "out.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--debug']))
    .it('runs impress.me Demo.md primary=blue debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--debug']))
    .it('runs impress.me Demo.md primary=blue secondary=purple debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=newspaper', '--debug']))
    .it('runs impress.me Demo.md primary=blue secondary=purple theme=newspaper debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=circle', '--debug']))
    .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--debug']))
    .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });

  test
    .stdout()
    .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--transitionDuration=0', '--debug']))
    .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none transitionDuration=0 debug', ctx => {
      expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"')
    });
});
