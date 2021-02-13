/**
 * Generates storybook stories for all existing examples and gallery entries.
 */

import {promises} from 'fs';
import * as path from 'path';
import {themes} from "../src";

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

storiesTitle = capitalize(path.basename('dist/gallery'));
promises.readdir('dist/gallery')
  .then(filenames =>
    themes.reduce((agg, theme) => ({
      ...agg,
      [theme.themeName]: filenames.filter(f => f.startsWith(`Demo-${theme.themeName}`) && f.endsWith('.html'))
        .map(f => createStory(cleanTitle(f.replace(`Demo-${theme.themeName}-`, '')), `${f}`)),
    }), {} as Record<string, string[]>)
  )
  .then(stories => themes.map(theme => {
    promises.writeFile('stories/gallery-' + theme.themeName + '.stories.ts', [header('Gallery', theme.themeName)].concat(stories[theme.themeName]).join('\n'));
  }))
