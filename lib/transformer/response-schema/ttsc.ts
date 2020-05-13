import * as ts from 'typescript';
import { SchemasObject, SchemaObject } from 'openapi3-ts';
import { getSchemaByType, TypeCache } from '../util/getSchemaByType';
import { convert } from '../util/convert';
import { getValue, isDecoratorNameInclude, walker } from '../util';

interface FileMetaType {
  methodDefine: {
    [cls_method: string]: {
      // 参数类型定义
      paramSchema: {
        [param: string]: SchemaObject;
      };
      // 返回参数
      responseSchema: ts.ObjectLiteralExpression;
    };
  };
  schemaObjects: SchemasObject;
  typeCache: TypeCache[];
}

const METADATA: {
  [file: string]: FileMetaType;
} = {};

console.log('[egg-controller] load transformer: response-schema.');

export default function transformer(program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  return {
    before(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        before(ctx, sourceFile, typeChecker);
        return walker(sourceFile, ctx);
      };
    },

    after(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        after(ctx, sourceFile);
        return walker(sourceFile, ctx);
      };
    },
  };
}

export function before(
  _: ts.TransformationContext,
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
) {
  // 当前编译文件需要保存的数据
  const fileData = (METADATA[sourceFile.fileName] = {
    // 方法定义
    methodDefine: {},
    schemaObjects: {},
    typeCache: [],
  });

  // 遍历文件中所有的 class
  sourceFile.statements
    .filter(n => ts.isClassDeclaration(n))
    .forEach(node => {
      node.forEachChild(cbNode => {
        if (isDecoratorNameInclude(cbNode, 'route')) {
          const decorator = cbNode.decorators.find(dec => {
            return (dec.expression as any).expression.escapedText === 'route';
          });

          //#region find schema prop
          let expression = decorator.expression as ts.CallExpression;
          if (
            !expression.arguments.length ||
            !ts.isObjectLiteralExpression(expression.arguments[expression.arguments.length - 1])
          ) {
            expression.arguments = ts.createNodeArray([
              ...expression.arguments,
              ts.createObjectLiteral([], false),
            ]);
          }
          const routeArg = expression.arguments[
            expression.arguments.length - 1
          ] as ts.ObjectLiteralExpression;

          const schemaProp = getField(routeArg, 'schema');
          //#endregion

          const config = {
            typeChecker,
            schemaObjects: fileData.schemaObjects,
            typeCache: fileData.typeCache,
          };

          const type = typeChecker.getTypeAtLocation(cbNode);
          const callSignatures = type.getCallSignatures()[0];

          // params parser
          if (!hasField(schemaProp, 'requestBody')) {
            const parameters = callSignatures.getParameters();
            const paramSchema = parameters.reduce((s, p) => {
              const paramType = typeChecker.getTypeAtLocation(p.valueDeclaration);
              s[`${p.escapedName}`] = getSchemaByType(paramType, config);
              return s;
            }, {});
            schemaProp.properties = ts.createNodeArray([
              ...schemaProp.properties,
              ts.createPropertyAssignment(
                'requestBody',
                convert({ type: 'object', properties: paramSchema })
              ),
            ]);
          }

          // returnType parser
          if (!hasField(schemaProp, 'response')) {
            const returnType = typeChecker.getReturnTypeOfSignature(callSignatures);
            let responseSchema: SchemaObject;
            if (getValue(() => returnType.symbol.escapedName) === 'Promise') {
              responseSchema = getSchemaByType((returnType as any).typeArguments[0], {
                typeChecker,
                schemaObjects: fileData.schemaObjects,
                typeCache: fileData.typeCache,
              });
            } else {
              responseSchema = getSchemaByType(returnType as ts.ObjectType, config);
            }
            schemaProp.properties = ts.createNodeArray([
              ...schemaProp.properties,
              ts.createPropertyAssignment('response', convert(responseSchema)),
            ]);
          }

          if (!hasField(schemaProp, 'components')) {
            schemaProp.properties = ts.createNodeArray([
              ...schemaProp.properties,
              ts.createPropertyAssignment('components', ts.createIdentifier('__SchemaDefinition')),
            ]);
          }
        }
      });
    });
}

export function after(_: ts.TransformationContext, sourceFile: ts.SourceFile) {
  const fileData = METADATA[sourceFile.fileName];
  if (fileData) {
    sourceFile.statements = ts.createNodeArray([
      ts.createVariableStatement(
        [],
        ts.createVariableDeclarationList(
          [
            ts.createVariableDeclaration(
              '__SchemaDefinition',
              undefined,
              convert(fileData.schemaObjects)
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      ...sourceFile.statements,
    ]);
  }
}

function hasField(config: ts.ObjectLiteralExpression, fieldName: string) {
  return !!config.properties.find(p => {
    return ts.isIdentifier(p.name) && p.name.escapedText === fieldName;
  }) as any;
}

function getField(config: ts.ObjectLiteralExpression, fieldName: string) {
  let field: ts.ObjectLiteralExpression;
  field = config.properties.find(p => {
    return ts.isIdentifier(p.name) && p.name.escapedText === fieldName;
  }) as any;
  if (!field) {
    field = ts.createObjectLiteral();
    config.properties = ts.createNodeArray([
      ...config.properties,
      ts.createPropertyAssignment(fieldName, field),
    ]);
  } else {
    field = (field as any).initializer;
  }
  return field;
}
