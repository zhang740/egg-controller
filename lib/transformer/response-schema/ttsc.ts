import * as ts from 'typescript';
import { SchemasObject, SchemaObject } from 'openapi3-ts';
import { getSchemaByType, TypeCache } from '../util/getSchemaByType';
import { convert } from '../util/convert';
import { getValue, isDecoratorNameInclude, getClsMethodKey, walker } from '../util';
import { RESPONSE_SCHEMA_KEY, SCHEMA_DEFINITION_KEY, REQUEST_SCHEMA_KEY } from '../const';
import { EmitFlags } from 'typescript';

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
          const clsMethod = getClsMethodKey(
            (cbNode.parent as any).symbol.escapedName,
            (cbNode as any).symbol.escapedName
          );

          const config = {
            typeChecker,
            schemaObjects: fileData.schemaObjects,
            typeCache: fileData.typeCache,
          };

          const type = typeChecker.getTypeAtLocation(cbNode);
          const callSignatures = type.getCallSignatures()[0];

          // params parser
          const parameters = callSignatures.getParameters();
          const paramSchema = parameters.reduce((s, p) => {
            const paramType = typeChecker.getTypeAtLocation(p.valueDeclaration);
            s[`${p.escapedName}`] = getSchemaByType(paramType, config);
            return s;
          }, {});

          // returnType parser
          const returnType = typeChecker.getReturnTypeOfSignature(callSignatures);
          let realType: SchemaObject;
          if (getValue(() => returnType.symbol.escapedName) === 'Promise') {
            realType = getSchemaByType((returnType as any).typeArguments[0], {
              typeChecker,
              schemaObjects: fileData.schemaObjects,
              typeCache: fileData.typeCache,
            });
          } else {
            realType = getSchemaByType(returnType as ts.ObjectType, config);
          }

          if (!fileData.methodDefine[clsMethod]) {
            fileData.methodDefine[clsMethod] = {
              paramSchema,
              responseSchema: realType,
            };
          }
        }
      });
    });
}

export function after(_: ts.TransformationContext, sourceFile: ts.SourceFile) {
  const fileData = METADATA[sourceFile.fileName];
  if (fileData) {
    sourceFile.statements.forEach(node => {
      if (ts.isExpressionStatement(node) && (node as any).expression.arguments) {
        const className = getValue(
          () => (node as any).expression.arguments[1].expression.escapedText
        );
        const methodName = getValue(() => (node as any).expression.arguments[2].text);

        if (className && methodName) {
          const methodSchema = getValue(
            () => fileData.methodDefine[getClsMethodKey(className, methodName)]
          );

          if (methodSchema) {
            const addData = [
              ts.createCall(
                ts.setEmitFlags(
                  ts.createIdentifier('__metadata'),
                  EmitFlags.HelperName | EmitFlags.AdviseOnEmitNode
                ),
                undefined,
                [ts.createLiteral(SCHEMA_DEFINITION_KEY), ts.createIdentifier('__SchemaDefinition')]
              ),
            ];

            if (methodSchema.paramSchema) {
              addData.unshift(
                ts.createCall(
                  ts.setEmitFlags(
                    ts.createIdentifier('__metadata'),
                    EmitFlags.HelperName | EmitFlags.AdviseOnEmitNode
                  ),
                  undefined,
                  [ts.createLiteral(REQUEST_SCHEMA_KEY), convert(methodSchema.paramSchema)]
                )
              );
            }

            if (methodSchema.responseSchema) {
              addData.unshift(
                ts.createCall(
                  ts.setEmitFlags(
                    ts.createIdentifier('__metadata'),
                    EmitFlags.HelperName | EmitFlags.AdviseOnEmitNode
                  ),
                  undefined,
                  [ts.createLiteral(RESPONSE_SCHEMA_KEY), convert(methodSchema.responseSchema)]
                )
              );
            }

            (node as any).expression.arguments[0].elements = (node as any).expression.arguments[0].elements.concat(
              addData
            );
          }
        }
      }
    });

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
