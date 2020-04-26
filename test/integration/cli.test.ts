import {expect, test} from '@oclif/test';
import {shapes, strategies, themes} from '../../src';
import cmd = require('../../src/cli');

describe('impress.me', () => {
  describe('in/out', () => {
    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--debug']))
      .it('runs impress.me Demo.md', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', 'out.html', '--debug']))
      .it('runs impress.me Demo.md out.html', ctx => {
        expect(ctx.stdout).to.contain('Creating "out.html" from "Demo.md"');
      });
  });

  describe('various params', () => {
    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--debug']))
      .it('runs impress.me Demo.md primary=blue debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--debug']))
      .it('runs impress.me Demo.md primary=blue secondary=purple debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=circle', '--debug']))
      .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--debug']))
      .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--transitionDuration=0', '--debug']))
      .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none transitionDuration=0 debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });

    test
      .stdout()
      .do(() => cmd.run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--transitionDuration=0', '--strategy=column', '--debug']))
      .it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none transitionDuration=0 strategy=column debug', ctx => {
        expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
      });
  });

  describe('themes', () => {
    themes.forEach(theme => {
      test
        .stdout()
        .do(() => cmd.run(['Demo.md', '--theme=' + theme.themeName, '--debug']))
        .it('runs impress.me Demo.md theme=' + theme.themeName + ' debug', ctx => {
          expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
        });
    });
  });

  describe('strategies', () => {
    strategies.forEach(strategy => {
      test
        .stdout()
        .do(() => cmd.run(['Demo.md', '--strategy=' + strategy, '--debug']))
        .it('runs impress.me Demo.md strategy=' + strategy + ' debug', ctx => {
          expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
        });
    });
  });

  describe('shapes', () => {
    shapes.forEach(shape => {
      test
        .stdout()
        .do(() => cmd.run(['Demo.md', '--shape=' + shape, '--debug']))
        .it('runs impress.me Demo.md shape=' + shape + ' debug', ctx => {
          expect(ctx.stdout).to.contain('Creating "Demo.html" from "Demo.md"');
        });
    });
  });
});
