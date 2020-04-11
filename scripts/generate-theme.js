var fs = require('fs');
var colors = require('material-colors');

const excluded = [
  'default',
  'darkIcons',
  'darkText',
  'lightText',
  'lightIcons',
  'black',
  'white',
];

fs.writeFile(
  'css/colors.css',
  Object.keys(colors)
    .filter(colorName => !excluded.includes(colorName))
    .map(colorName => {
      const color = colors[colorName];
      return `/*
 * ${colorName}
 */
.primary-${colorName} {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['500']}, ${color['800']});
}
.secondary-${colorName} a {
  color: ${color['500']};
  text-decoration: none;
}
.secondary-${colorName} a:hover,
.secondary-${colorName} a:active {
  color: #fff;
  background: ${color['500']};
}
.secondary-${colorName} .step.title {
  color: #fff;
}
.secondary-${colorName} .step.title a {
  color: #fff;
}
.secondary-${colorName} .step.title a:hover,
.secondary-${colorName} .step.title a:active {
  color: ${color['200']};
}
.secondary-${colorName} .impress-progressbar > div {
  background: ${color['500']};
}
.secondary-${colorName} .impress-progressbar > div:after {
  background: ${color['500']};
}
.secondary-${colorName} #impress-toolbar button#impress-autoplay-playpause {
  color: #fff;
  font-weight: bold;
  background: ${color['500']};
}
`;
    })
    .join('\n'),
  () => console.log('CSS themes file written'),
);
