import {Theme} from "./theme";

export const themes: Record<string, Theme> = {
  planet: {
    themeName: 'planet',
    shape: 'circle',
    strategy: 'planet'
  },
  slides: {
    themeName: 'slides',
    shape: 'rounded',
    strategy: 'linear'
  },
  newspaper: {
    themeName: 'newspaper',
    shape: 'none',
    strategy: 'newspaper'
  }
};
