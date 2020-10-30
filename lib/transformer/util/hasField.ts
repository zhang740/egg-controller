import * as ts from 'typescript';
import { getField } from './getField';

export function hasField(config: ts.Expression | undefined, fieldName: string) {
  return !!getField(config, fieldName);
}
