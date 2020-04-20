import {PlanetPositionStrategy, PositionStrategy} from '../../src/position';
import {defaultConfig, ImpressMeConfig, SlideNode, Transformation} from '../../src';
import {expect} from '@oclif/test';

const config: ImpressMeConfig = defaultConfig;
const circleRadius = 1680;

const updatePositions = (strategy: PositionStrategy, node: SlideNode): void => {
  node.pos = strategy.calculate(node);
  node.children.forEach(child => updatePositions(strategy, child));
};

const assertPosition = (pos: Transformation, config: ImpressMeConfig, radius: number, text = 'node'): void => {
  expect(pos!.x).to.be
    .above(-config.width / 2, `x of ${text}`)
    .below(config.width / 2, `x of ${text}`);
  expect(pos!.y).to.be
    .above(-config.height / 2, `y of ${text}`)
    .below(config.height / 2, `y of ${text}`);
};

const assertPositions = (children: SlideNode[], config: ImpressMeConfig, radius: number): void =>
  children.forEach(node => assertPosition(node.pos!, config, radius, node.text));

describe('PlanetPositionStrategy', () => {
  describe('depth 1', () => {
    it('should return default position', () => {
      // given
      const target = new PlanetPositionStrategy(config);
      const node: SlideNode = {
        text: 'root',
        depth: 1,
        children: [],
        attrs: {},
      };

      // when
      const actual = target.calculate(node);

      // then
      expect(actual).to.deep.eq({
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
      });
    });
  });

  describe('depth 2', () => {
    describe('1 child', () => {
      const root: SlideNode = {
        text: 'depth-1',
        depth: 1,
        children: [],
        attrs: {},
      };
      root.children = [1].map(id => ({
        text: `depth-2-${id}`,
        depth: 2,
        parent: root,
        children: [],
        attrs: {},
      }));

      it('should return valid position for all depth-2 nodes', () => {
        // given
        const target = new PlanetPositionStrategy(config);

        // when
        updatePositions(target, root);

        // then
        assertPositions(root.children, config, circleRadius);
      });
    });

    describe('2 children', () => {
      const root: SlideNode = {
        text: 'root',
        depth: 1,
        children: [],
        attrs: {},
      };
      root.children = [1, 2].map(id => ({
        text: `depth-2-${id}`,
        depth: 2,
        parent: root,
        children: [],
        attrs: {},
      }));

      it('should return valid position for all depth-2 nodes', () => {
        // given
        const target = new PlanetPositionStrategy(config);

        // when
        updatePositions(target, root);

        // then
        assertPositions(root.children, config, circleRadius);
      });
    });

    describe('5 children', () => {
      const root: SlideNode = {
        text: 'root',
        depth: 1,
        children: [],
        attrs: {},
      };
      root.children = [1, 2, 3, 4, 5].map(id => ({
        text: `depth-2-${id}`,
        depth: 2,
        parent: root,
        children: [],
        attrs: {},
      }));

      it('should return valid position for all depth-2 nodes', () => {
        // given
        const target = new PlanetPositionStrategy(config);

        // when
        updatePositions(target, root);

        // then
        assertPositions(root.children, config, circleRadius);
      });
    });

    describe('16 children', () => {
      const root: SlideNode = {
        text: 'root',
        depth: 1,
        children: [],
        attrs: {},
      };
      root.children = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(id => ({
        text: `depth-2-${id}`,
        depth: 2,
        parent: root,
        children: [],
        attrs: {},
      }));

      it('should return valid position for all depth-2 nodes', () => {
        // given
        const target = new PlanetPositionStrategy(config);

        // when
        updatePositions(target, root);

        // then
        assertPositions(root.children, config, circleRadius);
      });
    });
  });
});
