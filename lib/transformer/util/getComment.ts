import * as ts from 'typescript';
import { getValue } from './getValue';

export function getComment(symbol: ts.Symbol) {
  return getValue(() => (symbol.valueDeclaration as any).jsDoc[0].comment);
}
