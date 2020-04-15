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
body.primary-${colorName} {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['500']}, ${color['800']});
}

[class*=shape-] .primary-${colorName}.slide {
  color: #fff;

  &:before {
    background: ${color['500']};
  }
}

.secondary-${colorName} {
  a {
    color: ${color['500']};
    text-decoration: none;

    &:hover,
    &:active {
      color: #fff;
      background: ${color['500']};
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

    &:after {
      background: ${color['500']};
    }
  }

  #impress-toolbar button#impress-autoplay-playpause {
    color: #fff;
    background: ${color['500']};
  }
}
`;

fs.writeFile(
  'css/colors.scss',
  Object.keys(colors)
    .filter(colorName => !excluded.includes(colorName))
    .map(colorName => colorTemplate(colorName, colors[colorName]))
    .join(''),
  () => console.log('CSS themes file written'), // eslint-disable-line no-console
);
