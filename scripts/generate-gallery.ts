// eslint-disable no-console

import {ImpressMe, shapes, strategies, themeMap, themes} from '../src';
import * as fs from 'fs';
import {mkdirSync, promises} from 'fs';

const captureWebsite = require('capture-website');

if (!fs.existsSync('dist/gallery')) {
  mkdirSync('dist/gallery', {recursive: true});
}

const title = `Impress.me Gallery
==================

`;
const overview = `
## Overview [](class=overview)
`;

Promise.all(themes.map(theme => {
  const themeName = theme.themeName;

  return Promise.all(strategies.map(strategy => {
    return Promise.all(shapes.map(shape => {
      const presentation = `dist/gallery/Demo-${themeName}-${strategy}-${shape}.html`;
      const screenshot = `dist/gallery/Demo-${themeName}-${strategy}-${shape}.png`;

      return new ImpressMe({theme, strategy, shape})
        .convert('Demo.md', presentation)
        .then(() => console.log('Generated ' + presentation))
        .then(() => captureWebsite.file(
          presentation,
          screenshot,
          {
            width: 1920 / 2,
            height: 1080 / 2,
            delay: 10,
            overwrite: true,
          },
        ))
        .then(() => console.log('Captured ' + screenshot))
        .then(() => `### ${themeName} ${strategy} ${shape} [](class=focus-single)

[![Shape ${shape}](Demo-${themeName}-${strategy}-${shape}.png)](Demo-${themeName}-${strategy}-${shape}.html)\n`)
        .catch(error => {
          console.error(error);
          return '';
        });
    }))
      .then(markdowns => markdowns.join('\n'));
  }))
    .then(markdowns => [`## ${themeName}\n`, ...markdowns].join('\n'));
}))
  .then(markdowns => [title, ...markdowns, overview].join('\n'))
  .then(markdown => promises.writeFile('dist/gallery/Gallery.md', markdown))
  .then(() => new ImpressMe({theme: themeMap.gallery}).convert('dist/gallery/Gallery.md'))
  .then(() => console.log('Gallery generated'));

// eslint-enable no-console
