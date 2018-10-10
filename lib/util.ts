import * as fs from 'fs';
import * as path from 'path';

const generatorFuncPrototype = Object.getPrototypeOf(function* (): any { });
export function isGeneratorFunction(fn: any) {
  return typeof fn === 'function' && Object.getPrototypeOf(fn) === generatorFuncPrototype;
}

const asyncFuncPrototype = Object.getPrototypeOf(async function () { });
export function isAsyncFunction(fn: any) {
  return typeof fn === 'function' && Object.getPrototypeOf(fn) === asyncFuncPrototype;
}

export type MethodType =
  // from utils.methods
  'head' | 'options' | 'get' | 'put' | 'patch' | 'post' | 'delete' |
  // from egg
  'all' | 'resources' | 'register' | 'redirect';

const methodPrefix: { method: MethodType, keys: string[] }[] = [
  { method: 'get', keys: ['get', 'find', 'query'] },
  { method: 'put', keys: ['put', 'modify', 'save', 'update', 'change'] },
  { method: 'post', keys: ['post', 'add', 'create'] },
  { method: 'delete', keys: ['delete', 'remove'] },
];
export function getNameAndMethod(funcName: string) {
  let method: MethodType = 'get', name = funcName;

  let tmpName = funcName.toLowerCase(), usePrefix = '';
  const prefix = methodPrefix.find(p => p.keys.some(k => {
    if (tmpName.startsWith(k)) {
      usePrefix = k;
      return true;
    }
    return false;
  }));
  if (prefix) {
    name = tmpName.substring(usePrefix.length) || funcName;
    method = prefix.method;
  }

  return { name, method };
}

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]*/mg;
const FAT_ARROWS = /=>.*$/mg;

export function getParameterNames(fn: Function | string) {
  let code = typeof fn === 'function' ? fn.toString() : fn;

  let right = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '(') {
      right++;
    } else if (char === ')') {
      right--;
      if (right === 0) {
        right = i;
        break;
      }
    }
  }

  code = code
    .substring(code.indexOf('(') + 1, right)
    .replace(COMMENTS, '');

  const sub = code.match(/\(.*?\)/g);
  if (sub) sub.forEach(sub => code = code.replace(sub, ''));

  return code
    .replace(DEFAULT_PARAMS, '')
    .replace(FAT_ARROWS, '')
    .match(/([^\s,]+)/g) || [];
}

export function getValue<T = any>(func: () => T, defaultValue?: T) {
  try {
    return func();
  } catch (error) {
    return defaultValue;
  }
}

function getFile(filePath: string) {
  const parsedPath = path.parse(filePath);
  if (parsedPath.ext === '.ts' && filePath.indexOf('.d.ts') < 0) {
    const jsPath = path.join(parsedPath.dir, `${parsedPath.name}.js`);
    if (fs.existsSync(jsPath)) {
      return jsPath;
    } else {
      return filePath;
    }
  }
  if (parsedPath.ext === '.js') {
    return filePath;
  }
}

export function loadDir(dirPath: string) {
  const files: string[] = [];
  const dirStat = fs.statSync(dirPath);
  if (dirStat.isFile()) {
    const filePath = getFile(dirPath);
    filePath && files.push(filePath);
  } else if (dirStat.isDirectory()) {
    fs.readdirSync(dirPath)
      .forEach(dirName => {
        const fullPath = path.join(dirPath, dirName);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...loadDir(fullPath));
        } else if (stat.isFile()) {
          const filePath = getFile(fullPath);
          filePath && files.push(filePath);
        }
      });
  }
  return Array.from(new Set(files));
}

export function formatKey(key: string, type: string) {
  const item = key.split('\n').map(val => val.trim());
  if (item[0].includes(type)) {
    item.shift();
  }
  if (item[item.length - 1].includes(type)) {
    item.pop();
  }
  return `-----BEGIN ${type}-----\n${item.join('')}\n-----END ${type}-----`;
}
