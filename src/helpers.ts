import * as path from "path";
import * as fs from "fs";

const module_path = path.dirname(__dirname);

export const resolve_path = (path: string): string => {
  return [
    module_path + '/' + path,
    path,
    'node_modules/' + path,
    '../' + path
  ].find(fs.existsSync) || path;
};
