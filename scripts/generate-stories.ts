import {promises} from 'fs';
import * as path from "path";

const header = (title: string): string => `export default {title: '${title}'};
`;

const capitalize = (s: string): string =>
  s.split(/\W/).map(word => word[0].toUpperCase() + word.substr(1)).join(' ');

const cleanTitle = (filename: string): string =>
  capitalize(filename.replace(/(.md)?.html$/, ''))
    .replace(/^Demo /, '')
    .replace(/\W/g, '');

const createStory = (title: string, filename: string): string =>
  `export const ${title} = () => '<iframe class="fullscreen" src="${filename}"></iframe>';\n`;

['dist/examples', 'dist/gallery'].forEach(storyDir => {
  const storiesTitle = capitalize(path.basename(storyDir));
  promises.readdir(storyDir)
    .then(filenames =>
      filenames.filter(f => f.endsWith('.html')).map(f => createStory(cleanTitle(f), `${f}`))
    )
    .then(stories => [header(storiesTitle)].concat(stories))
    .then(contents =>
      promises.writeFile('stories/' + storiesTitle.toLowerCase() + '.stories.ts', contents.join('\n')))
});
