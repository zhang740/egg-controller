import * as ts from 'typescript';
import { SchemaObject, SchemasObject, ReferenceObject } from 'openapi3-ts';
import { getValue } from '../../util';
import { getComment } from './getComment';
import { isArrayType } from './isArrayType';
import { getHashCode } from '.';

export interface GetSchemaConfig {
  schemaObjects: SchemasObject;
  typeChecker: ts.TypeChecker;
  extendClass?: boolean;
}

export function getSchemaByType(type: ts.Type, config: GetSchemaConfig): SchemaObject {
  const { typeChecker } = config;

  // 接口层拆掉 Promise (Promise 对应 orm 中定义 lazy 情况)
  if (getValue(() => type.symbol.escapedName) === 'Promise') {
    type = (type as any).typeArguments[0];
  }

  const defaultSchemaObject: SchemaObject = {};
  const comment = getComment((type as any).type || type);
  if (comment) {
    defaultSchemaObject.description = comment;
  }
  const objectFlags = (type as ts.ObjectType).objectFlags;
  if (isArrayType(type)) {
    return {
      ...defaultSchemaObject,
      type: 'array',
      items: getSchemaByType((type as any).typeArguments[0], config),
    };
  } else if (type.flags & ts.TypeFlags.Boolean) {
    // boolean is kind of union
    return {
      ...defaultSchemaObject,
      type: 'boolean',
    };
  } else if (type.isUnion && type.isUnion()) {
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
        oneOf: unionType.types.map(t => getSchemaByType(t, config)),
      };
    }
  } else if (type.isClassOrInterface()) {
    if (type.symbol.escapedName === 'Date') {
      return {
        ...defaultSchemaObject,
        type: 'string',
        format: 'date',
      };
    }
    return config.extendClass
      ? extendClass(type, defaultSchemaObject, config)
      : addRefTypeSchema(type, config);
  } else if (objectFlags & ts.ObjectFlags.Anonymous) {
    return extendClass(type as ts.InterfaceType, defaultSchemaObject, config);
  }
  return {
    ...defaultSchemaObject,
    type: typeChecker.typeToString(type),
  };
}

function addRefTypeSchema(type: ts.InterfaceType, config: GetSchemaConfig): ReferenceObject {
  const { schemaObjects } = config;
  let typeName = `${type.symbol.escapedName}`;
  const schema = getSchemaByType(type, { ...config, extendClass: true });
  const hashCode = getHashCode(schema);
  if (schemaObjects[typeName] && schemaObjects[typeName].hashCode !== hashCode) {
    let i = 1;
    while (schemaObjects[`${typeName}_${i}`]) {
      i++;
    }
    typeName = i ? `${typeName}_${i}` : typeName;
  }
  schemaObjects[typeName] = { ...schema, hashCode };
  return {
    $ref: typeName,
  };
}

function extendClass(
  type: ts.InterfaceType,
  defaultSchemaObject: Partial<SchemaObject>,
  config: GetSchemaConfig
) {
  config = { ...config, extendClass: false };

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
      function setProp(value: any) {
        if (!getValue(() => (symbol.valueDeclaration as any).questionToken)) {
          schema.required.push(escapedName);
        }
        schema.properties[escapedName] = {
          description: getComment(symbol),
          ...value,
        };
      }

      if (
        ts.isMethodDeclaration(symbol.valueDeclaration) ||
        ts.isMethodSignature(symbol.valueDeclaration) ||
        ts.isArrowFunction(symbol.valueDeclaration)
      ) {
        // 函数忽略
        return;
      }

      const targetType = getValue(() => (symbol as any).type || (symbol as any).target.type);
      if (targetType) {
        setProp(getSchemaByType(targetType, config));
      } else if (symbol.valueDeclaration) {
        const propType = config.typeChecker.getTypeAtLocation(symbol.valueDeclaration);

        // check arrow function prop.
        const arrowType = getValue(() => propType.symbol.valueDeclaration);
        if (arrowType && ts.isArrowFunction(arrowType)) {
          return;
        }

        setProp(getSchemaByType(propType, config));
      } else {
        setProp({
          type: 'any',
        });
      }
    });
  return schema;
}
