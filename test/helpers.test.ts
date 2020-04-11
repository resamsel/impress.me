import {toOutputFilename} from '../src';
import {expect} from '@oclif/test';

describe('helpers', () => {
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
