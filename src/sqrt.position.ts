import {ImpressMdState, ImpressMeConfig, SlidePosition} from "./config";

export function sqrtPosition(config: ImpressMeConfig) {
  return function (step: number, level: number, state: ImpressMdState): SlidePosition {
    // console.error('position(' + step + ',' + level + ')', state);
    const siblings = state.current && state.current.parent ? state.current.parent.children : [];
    switch (level) {
      case 2: {
        const scale = 1 / (siblings.length + 3);
        return {
          x: -(config.width / 2) + config.offset.left + (siblings.length - 1) * config.stepDistance,
          y: -(config.height / 2) + config.offset.top - Math.sqrt((siblings.length - 1) * 50000),
          // z: -siblings.length,
          z: 0,
          scale
        };
      }
      case 3: {
        if (state.current === undefined || state.current.parent === undefined || state.current.parent.pos === undefined) {
          return {x: 0, y: 0, z: 0, scale: 1};
        }
        const parent = state.current.parent.pos;
        const scale = 0.05;
        const stepSizeScaled = (config.circleSize + 100) * scale;
        const h = parent.x - config.circleOffset * parent.scale;
        const k = parent.y;
        const r = (config.circleSize / 2) * parent.scale + (config.circleSize / 2 + 100) * scale;
        const c = r * 2 * Math.PI;
        const offsetRad = (stepSizeScaled / c) * 2 * Math.PI;
        const t = -offsetRad + offsetRad * (siblings.length - 1);
        return {
          x: r * Math.cos(t) + h,
          y: r * Math.sin(t) + k,
          // z: parent.z - siblings.length,
          z: 0,
          scale: scale
        };
      }
      default:
        return {
          x: 0,
          y: 0,
          z: 0,
          scale: 1
        };
    }
  };
}
