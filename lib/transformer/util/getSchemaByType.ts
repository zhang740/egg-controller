import * as ts from 'typescript';
import { SchemaObject } from 'openapi3-ts';
import { getTypeByKind } from './getTypeByKind';
import { getValue } from '../../util';
import { getComment } from './getComment';
import { isArrayType } from './isArrayType';
export function getSchemaByType(type: ts.Type, typeChecker: ts.TypeChecker): SchemaObject {
  const defaultSchemaObject: SchemaObject = {};
  const comment = getComment((type as any).type || type);
  const objectFlags = (type as ts.ObjectType).objectFlags;
  if (comment) {
    defaultSchemaObject.description = comment;
  }
  if (isArrayType(type)) {
    return {
      ...defaultSchemaObject,
      type: 'array',
      items: getSchemaByType((type as any).typeArguments[0], typeChecker),
    };
  } else if (type.flags & ts.TypeFlags.Boolean) {
    // boolean is kind of union
    return {
      ...defaultSchemaObject,
      type: 'boolean',
    };
  } else if (type.isUnion()) {
    const unionType: ts.UnionType = type as any;
    if (unionType.types.every(t => !!(t.flags & ts.TypeFlags.StringLiteral))) {
      return {
        ...defaultSchemaObject,
        type: 'string',
        enum: unionType.types.map(t => {
          const str = typeChecker.typeToString(t);
          return str.substr(1, str.length - 2);
        }),
      };
    } else {
      return {
        ...defaultSchemaObject,
        type: 'object',
        oneOf: unionType.types.map(t => getSchemaByType(t, typeChecker)),
      };
    }
  } else if (
    // TODO 引用类型不展开
    type.flags & ts.TypeFlags.Object ||
    objectFlags & ts.ObjectFlags.Anonymous
  ) {
    const schema: SchemaObject = {
      ...defaultSchemaObject,
      type: 'object',
      properties: {},
      required: [],
    };
    type
      .getProperties()
      .filter(
        symbol =>
          !symbol.valueDeclaration ||
          !symbol.valueDeclaration.modifiers ||
          symbol.valueDeclaration.modifiers.some(m => !!((m as any) & ts.ModifierFlags.Public))
      )
      .forEach(symbol => {
        const escapedName = `${symbol.escapedName}`;
        if (!getValue(() => (symbol.valueDeclaration as any).questionToken)) {
          schema.required.push(escapedName);
        }
        function setProp(value: any) {
          schema.properties[escapedName] = {
            description: getComment(symbol),
            ...value,
          };
        }
        const targetType = getValue(() => (symbol as any).target.type);
        if ((symbol as any).type) {
          const realType: ts.ObjectType = (symbol as any).type;
          setProp(getSchemaByType(realType, typeChecker));
        } else if (targetType) {
          setProp(getSchemaByType(targetType, typeChecker));
        } else if (getValue(() => (symbol.valueDeclaration as any).type.kind)) {
          setProp({
            type: getTypeByKind(symbol),
          });
        } else {
          setProp({
            type: 'any',
          });
        }
      });
    return schema;
  }
  return {
    ...defaultSchemaObject,
    type: typeChecker.typeToString(type),
  };
}
