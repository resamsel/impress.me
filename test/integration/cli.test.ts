import {captureOutput} from '@oclif/test';
import {expect} from 'chai';
import {shapes, strategies, themes} from '../../src';
import cmd = require('../../src/cli');

async function run(args: string[]): Promise<{stdout: string}> {
  const {stdout} = await captureOutput(async () => cmd.run(args));
  return {stdout: stdout ?? ''};
}

describe('impress.me', () => {
  describe('in/out', () => {
    it('runs impress.me Demo.md', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md out.html', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', 'out.html', '--debug']);
      expect(stdout).to.contain('Created "out.html" from "Demo.md"');
    });
  });

  describe('various params', () => {
    it('runs impress.me Demo.md primary=blue debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md primary=blue secondary=purple debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--secondary=purple', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md primary=blue secondary=purple theme=slides debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=circle', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none transitionDuration=0 debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--transitionDuration=0', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });

    it('runs impress.me Demo.md primary=blue secondary=purple theme=slides shape=none transitionDuration=0 strategy=column debug', async function () {
      this.timeout(10000);
      const {stdout} = await run(['Demo.md', '--primary=blue', '--secondary=purple', '--theme=slides', '--shape=none', '--transitionDuration=0', '--strategy=column', '--debug']);
      expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
    });
  });

  describe('themes', () => {
    themes.forEach(theme => {
      it('runs impress.me Demo.md theme=' + theme.themeName + ' debug', async function () {
        this.timeout(10000);
        const {stdout} = await run(['Demo.md', '--theme=' + theme.themeName, '--debug']);
        expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
      });
    });
  });

  describe('strategies', () => {
    strategies.forEach(strategy => {
      it('runs impress.me Demo.md strategy=' + strategy + ' debug', async function () {
        this.timeout(10000);
        const {stdout} = await run(['Demo.md', '--strategy=' + strategy, '--debug']);
        expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
      });
    });
  });

  describe('shapes', () => {
    shapes.forEach(shape => {
      it('runs impress.me Demo.md shape=' + shape + ' debug', async function () {
        this.timeout(10000);
        const {stdout} = await run(['Demo.md', '--shape=' + shape, '--debug']);
        expect(stdout).to.contain('Created "Demo.html" from "Demo.md"');
      });
    });
  });
});
