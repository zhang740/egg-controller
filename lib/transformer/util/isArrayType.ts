import * as ts from 'typescript';
import { getValue } from './getValue';

export function isArrayType(type: ts.Type) {
  const name = getValue(() => type.symbol.escapedName) + '';
  return ['Array', 'Set'].includes(name);
}
