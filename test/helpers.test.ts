import {toOutputFilename} from "../src";
import {expect} from "@oclif/test";

describe('helpers', () => {
  it('toOutputFilename', () => {
    // given
    const input = 'a';

    // when
    const actual = toOutputFilename(input);

    // then
    expect(actual).to.eq('a.html');
  });
});
