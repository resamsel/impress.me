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
.primary-${colorName}:not(.slide) {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['800']}, ${color['500']});
}

[class*=shape-] .primary-${colorName}.slide {
  color: #fff;

  &::before {
    background: ${color['500']};
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
        /* stylelint-disable-next-line color-hex-length */
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
  Object.keys(colors)
    .filter(colorName => !excluded.includes(colorName))
    .map(colorName => colorTemplate(colorName.toLowerCase(), colors[colorName]))
    .join(''),
  () => console.log('Colors style file written'),
);
