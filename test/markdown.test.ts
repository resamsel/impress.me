import {defaultConfig, generateState, LinearPositionStrategy} from '../src';
import {expect} from '@oclif/test';
import Heading = marked.Tokens.Heading;

describe('markdown', () => {
  describe('generateState', () => {
    it('should generate the state for an empty doc', function () {
      // given
      const config = defaultConfig;
      const headings: Heading[] = [];
      const positionStrategy = config.positionStrategyFactory.create(config);

      // when
      const actual = generateState(headings, positionStrategy, config);

      expect(actual.root.text).to.be.undefined;
      expect(actual.root.depth).to.be.undefined;
      expect(actual.root.children).to.be.undefined;
      expect(Object.keys(actual.nodes)).to.have.length(0);
    });

    it('should generate the state for a single slide doc', function () {
      // given
      const config = defaultConfig;
      const headings: Heading[] = [{type: 'heading', depth: 1, text: 'Title'}];
      const positionStrategy = new LinearPositionStrategy(config);

      // when
      const actual = generateState(headings, positionStrategy, config);

      expect(actual.root.text).to.eq('Title');
      expect(actual.root.depth).to.eq(1);
      expect(actual.root.children).to.have.length(0);
      expect(Object.keys(actual.nodes)).to.have.length(1);
      expect(actual.nodes.Title.classes).to.contain('depth-1');
    });

    it('should generate the state for a three slide doc', function () {
      // given
      const config = defaultConfig;
      const headings: Heading[] = [
        {type: 'heading', depth: 1, text: 'Title'},
        {type: 'heading', depth: 2, text: 'First'},
        {type: 'heading', depth: 2, text: 'Second'},
      ];
      const positionStrategy = new LinearPositionStrategy(config);

      // when
      const actual = generateState(headings, positionStrategy, config);

      expect(actual.root.children).to.have.length(2);
      expect(Object.keys(actual.nodes)).to.have.length(3);
      expect(actual.nodes.Title.text).to.eq('Title');
      expect(actual.nodes.Title.depth).to.eq(1);
      expect(actual.nodes.Title.classes).to.contain('depth-1');
      expect(actual.nodes.Title.children).to.have.length(2);
      expect(actual.nodes.First.text).to.eq('First');
      expect(actual.nodes.First.depth).to.eq(2);
      expect(actual.nodes.First.classes).to.contain('depth-2');
      expect(actual.nodes.First.children).to.have.length(0);
      expect(actual.nodes.Second.text).to.eq('Second');
      expect(actual.nodes.Second.depth).to.eq(2);
      expect(actual.nodes.Second.classes).to.contain('depth-2');
      expect(actual.nodes.Second.children).to.have.length(0);
    });

    it('should generate the state for a single slide doc with hasInlineConfig=true', function () {
      // given
      const config = {...defaultConfig, hasInlineConfig: true, title: 'Document Config'};
      const headings: Heading[] = [{type: 'heading', depth: 1, text: 'First'}];
      const positionStrategy = new LinearPositionStrategy(config);

      // when
      const actual = generateState(headings, positionStrategy, config);

      expect(actual.root.text).to.eq('First');
      expect(actual.root.depth).to.eq(1);
      expect(actual.root.children).to.have.length(0);
      expect(Object.keys(actual.nodes)).to.have.length(1);
      expect(actual.nodes.First.text).to.eq('First');
      expect(actual.nodes.First.depth).to.eq(1);
      expect(actual.nodes.First.classes).to.contain('depth-1');
      expect(actual.nodes.First.children).to.have.length(0);
    });

    it('should generate the state for a three slide doc with hasInlineConfig=true', function () {
      // given
      const config = {...defaultConfig, hasInlineConfig: true};
      const headings: Heading[] = [
        {type: 'heading', depth: 1, text: 'First'},
        {type: 'heading', depth: 1, text: 'Second'},
        {type: 'heading', depth: 1, text: 'Third'},
      ];
      const positionStrategy = new LinearPositionStrategy(config);

      // when
      const actual = generateState(headings, positionStrategy, config);

      expect(actual.root.text).to.eq('First');
      expect(actual.root.depth).to.eq(1);
      expect(actual.root.children).to.have.length(2);
      expect(Object.keys(actual.nodes)).to.have.length(3);
      expect(actual.nodes.First.text).to.eq('First');
      expect(actual.nodes.First.depth).to.eq(1);
      expect(actual.nodes.First.classes).to.contain('depth-1');
      expect(actual.nodes.First.children).to.have.length(2);
      expect(actual.nodes.Second.text).to.eq('Second');
      expect(actual.nodes.Second.depth).to.eq(2);
      expect(actual.nodes.Second.classes).to.contain('depth-2');
      expect(actual.nodes.Second.children).to.have.length(0);
      expect(actual.nodes.Third.text).to.eq('Third');
      expect(actual.nodes.Third.depth).to.eq(2);
      expect(actual.nodes.Third.classes).to.contain('depth-2');
      expect(actual.nodes.Third.children).to.have.length(0);
    });
  });
});
