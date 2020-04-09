import {ImpressMeConfig} from "../config";
import {PositionStrategy} from "./position.strategy";
import {LinearPositionStrategy} from "./linear-position.strategy";
import {NewspaperPositionStrategy} from "./newspaper-position.strategy";
import {PlanetPositionStrategy} from "./planet-position.strategy";

export class PositionStrategyFactory {
  create(config: ImpressMeConfig): PositionStrategy {
    switch (config.strategy) {
      case 'linear':
        return new LinearPositionStrategy(config);
      case 'newspaper':
        return new NewspaperPositionStrategy(config);
      case 'planet':
      default:
        return new PlanetPositionStrategy(config);
    }
  }
}
