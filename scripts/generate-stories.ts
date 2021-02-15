/**
 * Generates storybook stories for all existing examples and gallery entries.
 */

import {promises} from 'fs';
import * as path from 'path';
import {shapes, strategies, themes} from "../src";

const header = (root: string, ...title: string[]): string => `export default {title: '${root}/${title.join('/')}'};
`;

const capitalize = (s: string): string =>
  s.split(/\W/).map(word => word[0].toUpperCase() + word.substr(1)).join(' ');

const cleanTitle = (filename: string): string =>
  capitalize(filename.replace(/(.md)?.html$/, ''))
    .replace(/^Demo /, '')
    .replace(/\W/g, '');

const createStory = (title: string, filename: string): string =>
  `export const ${title} = () => '<iframe class="fullscreen" src="${filename}"></iframe>';\n`;

let storiesTitle = capitalize(path.basename('dist/examples'));
promises.readdir('dist/examples')
  .then(filenames =>
    filenames.filter(f => f.endsWith('.html')).map(f => createStory(cleanTitle(f), `${f}`)),
  )
  .then(stories => [header('Examples', storiesTitle)].concat(stories))
  .then(contents =>
    promises.writeFile('stories/' + storiesTitle.toLowerCase() + '.stories.ts', contents.join('\n')));

themes.map(theme => ({
  name: theme.themeName,
  stories: [
    {name: 'Standard', file: 'Demo-' + theme.themeName + '.html'},
    ...strategies.filter(strategy => theme.strategy !== strategy)
      .map(strategy => [
        {name: 'Strategy ' + strategy, file: 'Demo-' + theme.themeName + '-' + strategy + '.html'},
        ...shapes.filter(shape => theme.shape !== shape)
          .map(shape => ({
            name: 'Strategy ' + strategy + ' shape ' + shape,
            file: 'Demo-' + [theme.themeName, strategy, shape].join('-') + '.html'
          })),
      ])
      .reduce((agg, curr) => [...agg, ...curr], [])
  ]
}))
  .map(theme => ({
    file: 'stories/gallery-' + theme.name + '.stories.ts',
    content: [
      header('Gallery', 'Theme ' + capitalize(theme.name)),
      ...theme.stories.map(story => createStory(cleanTitle(story.name), story.file))
    ].join('\n'),
  }))
    .forEach(({file, content}) => promises.writeFile(file, content));
