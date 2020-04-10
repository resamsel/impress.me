var fs = require('fs');
var colors = require('material-colors');

const excluded = [
  'default',
  'darkIcons',
  'darkText',
  'lightText',
  'lightIcons'
];

fs.writeFile(
  'css/colors.css',
  Object.keys(colors)
    .filter(colorName => !excluded.includes(colorName))
    .map(colorName => {
      const color = colors[colorName];
      return `
.primary-${colorName} {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['500']}, ${color['800']});
}
.secondary-${colorName} .step.title {
  color: #fff;
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
.secondary-${colorName} .impress-progressbar {
  background: ${color['200']};
}
.secondary-${colorName} .impress-progressbar > div {
  background: ${color['500']};
}
.secondary-${colorName} #impress-help {
  background: ${color['500']};
}
.secondary-${colorName} #impress-toolbar button,
.secondary-${colorName} #impress-toolbar select {
  color: #fff;
  font-weight: bold;
  background: ${color['500']};
}
`;
    })
    .join('\n'),
  () => console.log('CSS themes file written')
);
