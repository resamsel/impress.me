import {parseYamlConfig, splitConfigAndContent, toOutputFilename} from '../src';
import {expect} from '@oclif/test';
import {YAMLException} from 'js-yaml';

describe('helpers', () => {
  describe('splitConfigContent', () => {
    it('should return empty config string', function () {
      // given
      const content = '# My Presentation';

      // when
      const actual = splitConfigAndContent(content);

      // then
      expect(actual).to.deep.eq(['', '# My Presentation']);
    });

    it('should return simple config string', function () {
      // given
      const content = '---\nabc: true\n---\n# My Presentation';

      // when
      const actual = splitConfigAndContent(content);

      // then
      expect(actual).to.deep.eq(['abc: true', '# My Presentation']);
    });

    it('should return multi-line config string', function () {
      // given
      const content = '---------\n\nabc: true\n  sub: a\n-------\n# My Presentation';

      // when
      const actual = splitConfigAndContent(content);

      // then
      expect(actual).to.deep.eq(['abc: true\n  sub: a', '# My Presentation']);
    });
  });

  describe('parseYamlConfig', () => {
    it('should parse undefined to undefined', function () {
      // given
      const yaml = undefined;

      // when
      const actual = parseYamlConfig(yaml);

      // then
      expect(actual).to.be.undefined;
    });

    it('should parse empty string to undefined', function () {
      // given
      const yaml = '';

      // when
      const actual = parseYamlConfig(yaml);

      // then
      expect(actual).to.be.undefined;
    });

    it('should parse yaml config to impress.me config', function () {
      // given
      const yaml = 'title: My Title\nstrategy: planet';

      // when
      const actual = parseYamlConfig(yaml);

      // then
      expect(actual).to.deep.eq({title: 'My Title', strategy: 'planet', hasInlineConfig: true});
    });

    it('should parse failing yaml config to undefined', function () {
      // given
      const yaml = 'title: My Title\n  strategy: planet';

      // when
      const actual = () => parseYamlConfig(yaml);

      // then
      expect(actual).to.throw(YAMLException);
    });
  });

  describe('toOutputFilename', () => {
    it('should return a.html for input a', () => {
      // given
      const input = 'a';

      // when
      const actual = toOutputFilename(input);

      // then
      expect(actual).to.eq('a.html');
    });

    it('should return a.html for input a.md', () => {
      // given
      const input = 'a.md';

      // when
      const actual = toOutputFilename(input);

      // then
      expect(actual).to.eq('a.html');
    });

    it('should return a..html for input a.', () => {
      // given
      const input = 'a.';

      // when
      const actual = toOutputFilename(input);

      // then
      expect(actual).to.eq('a..html');
    });

    it('should return a.b.html for input a.b.md', () => {
      // given
      const input = 'a.b.md';

      // when
      const actual = toOutputFilename(input);

      // then
      expect(actual).to.eq('a.b.html');
    });
  });
});
