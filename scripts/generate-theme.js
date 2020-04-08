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
      return `.primary-${colorName} {
  background: ${color['500']};
  background: linear-gradient(to right bottom, ${color['500']}, ${color['800']});
}
.secondary-${colorName} a {
  border-bottom: 1px solid ${color['500']};
}
.secondary-${colorName} a:hover,
.secondary-${colorName} a:active {
  color: ${color['500']};
}
`;
    })
    .join('\n'),
  () => console.log('CSS themes file written')
);
