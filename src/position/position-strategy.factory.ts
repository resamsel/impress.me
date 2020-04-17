import {PositionStrategy} from './position.strategy';
import {LinearPositionStrategy} from './linear-position.strategy';
import {PlanetPositionStrategy} from './planet-position.strategy';
import {ImpressMeConfig} from '../impress-me-config';
import {Strategy} from '../strategy';
import {ColumnPositionStrategy} from './column-position.strategy';
import {RowPositionStrategy} from './row-position.strategy';

export class PositionStrategyFactory {
  create(config: ImpressMeConfig): PositionStrategy {
    switch (config.strategy) {
      case Strategy.Linear:
        return new LinearPositionStrategy(config);
      case Strategy.Column:
        return new ColumnPositionStrategy(config);
      case Strategy.Row:
        return new RowPositionStrategy(config);
      case Strategy.Planet:
      default:
        return new PlanetPositionStrategy(config);
    }
  }
}
