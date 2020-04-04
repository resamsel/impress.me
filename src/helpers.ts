import * as path from "path";
import * as fs from "fs";

var module_path = path.dirname(__dirname);

export const resolve_path = (path: string): string => {
  return [
    path,
    module_path + '/' + path,
    'node_modules/' + path,
    '../' + path
  ].find(fs.existsSync) || path;
};
