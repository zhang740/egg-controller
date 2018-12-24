import * as ts from 'typescript';
import { getValue } from './getValue';

export function isArrayType(type: ts.Type) {
  return getValue(() => type.symbol.escapedName) === 'Array';
}
