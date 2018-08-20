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

const methods: MethodType[] = ['get', 'put', 'post', 'delete', 'patch'];
export function getNameAndMethod(functionName: string) {
  let name = functionName, functionMethod: MethodType = 'get';
  functionName = functionName.toLowerCase();

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    if (functionName.startsWith(method)) {
      name = functionName.substring(method.length) || functionName;
      functionMethod = method;
      break;
    }
  }

  return { name, method: functionMethod };
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

export function getValue<T = any>(func: () => T, defaultValue: T) {
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
