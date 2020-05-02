import * as fs from 'fs';

const colors = require('material-colors');

const excluded = [
  'default',
  'darkIcons',
  'darkText',
  'lightText',
  'lightIcons',
  'black',
  'white',
];

const colorTemplate = (colorName: string, color: any) => `
/*
 * ${colorName}
 */
.primary-${colorName} {
  $primary-50: ${color['50']};
  $primary-100: ${color['100']};
  $primary-200: ${color['200']};
  $primary-300: ${color['300']};
  $primary-400: ${color['400']};
  $primary-500: ${color['500']};
  $primary-600: ${color['600']};
  $primary-700: ${color['700']};
  $primary-800: ${color['800']};
  $primary-900: ${color['900']};
}

.primary-${colorName}:not(.slide) {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['800']}, ${color['500']});
}

[class*=shape-] .primary-${colorName}.slide {
  h2,
  h3 {
    color: ${color['900']};
  }

  &::before {
    background: ${color['100']};
  }
}

.secondary-${colorName} {
  a {
    color: ${color['500']};
    text-decoration: none;

    &:hover,
    &:active {
      background: ${color['500']};
      color: #fff;
    }
  }

  .step.title {
    color: #fff;

    a {
      color: #fff;

      &:hover,
      &:active {
        color: ${color['200']};
      }
    }
  }

  .impress-progressbar > div {
    background: ${color['500']};

    &::after {
      background: ${color['500']};
    }
  }

  #impress-autoplay-playpause {
    background: ${color['500']};
    color: #fff;
  }
}
`;

fs.writeFile(
  'css/colors.scss',
  ['/* stylelint-disable color-hex-length */']
    .concat(Object.keys(colors)
      .filter(colorName => !excluded.includes(colorName))
      .map(colorName => colorTemplate(colorName.toLowerCase(), colors[colorName])))
    .join(''),
  () => console.log('Colors style file written'),
);
