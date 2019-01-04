import * as ts from 'typescript';
import { SchemasObject, SchemaObject } from 'openapi3-ts';
import { getSchemaByType } from '../util/getSchemaByType';
import { convert } from '../util/convert';
import {
  getValue,
  getHashCode,
  getComment,
  isDecoratorNameInclude,
  getClsMethodKey,
  walker,
} from '../util';
import { RESPONSE_SCHEMA_KEY, SCHEMA_DEFINITION_KEY } from '../const';

interface FileMetaType {
  methodDefine: {
    [cls_method: string]: {
      // TODO 参数类型定义
      paramSchema: {
        [param: string]: SchemaObject;
      };
      // 返回参数
      responseSchema: ts.ObjectLiteralExpression;
    };
  };
  schemaObjects: SchemasObject;
}

const METADATA: {
  [file: string]: FileMetaType;
} = {};

function parseTypeSchema(
  type: ts.ObjectType,
  fileData: FileMetaType,
  typeChecker: ts.TypeChecker
): SchemaObject {
  if (type.isClassOrInterface()) {
    let typeName = `${type.symbol.escapedName}`;
    const schema = getSchemaByType(type, typeChecker);
    const hashCode = getHashCode(schema);
    if (
      fileData.schemaObjects[typeName] &&
      fileData.schemaObjects[typeName].hashCode !== hashCode
    ) {
      let i = 1;
      while (fileData.schemaObjects[`${typeName}_${i}`]) {
        i++;
      }
      typeName = i ? `${typeName}_${i}` : typeName;
    }
    fileData.schemaObjects[typeName] = { ...schema, hashCode };
    return {
      $ref: typeName,
      description: getComment(type.symbol),
    };
  }
  return getSchemaByType(type, typeChecker);
}

console.log('[egg-controller] load transformer: response-schema.');

export default function transformer(program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  return {
    before(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        // 当前编译文件需要保存的数据
        const fileData = (METADATA[sourceFile.fileName] = {
          // 方法定义
          methodDefine: {},
          schemaObjects: {},
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

                const type = typeChecker.getTypeAtLocation(cbNode);
                const returnType = typeChecker.getReturnTypeOfSignature(
                  type.getCallSignatures()[0]
                );
                let realType: SchemaObject;
                if (getValue(() => returnType.symbol.escapedName) === 'Promise') {
                  realType = parseTypeSchema(
                    (returnType as any).typeArguments[0],
                    fileData,
                    typeChecker
                  );
                } else {
                  realType = parseTypeSchema(returnType as ts.ObjectType, fileData, typeChecker);
                }
                if (!fileData.methodDefine[clsMethod]) {
                  fileData.methodDefine[clsMethod] = {
                    paramSchema: {},
                    responseSchema: realType,
                  };
                }
              }
            });
          });

        return walker(sourceFile, ctx);
      };
    },

    after(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        const fileData = METADATA[sourceFile.fileName];

        if (fileData) {
          sourceFile.statements.forEach(node => {
            if (ts.isExpressionStatement(node) && (node as any).expression.arguments) {
              const className = getValue(
                () => (node as any).expression.arguments[1].expression.escapedText
              );
              const methodName = getValue(() => (node as any).expression.arguments[2].text);

              if (className && methodName) {
                const responseSchema = getValue(
                  () => fileData.methodDefine[getClsMethodKey(className, methodName)].responseSchema
                );
                if (responseSchema) {
                  (node as any).expression.arguments[0].elements = (node as any).expression.arguments[0].elements.concat(
                    ts.createCall((ts as any).getHelperName('__metadata'), undefined, [
                      ts.createLiteral(RESPONSE_SCHEMA_KEY),
                      convert(responseSchema),
                    ]),
                    ts.createCall((ts as any).getHelperName('__metadata'), undefined, [
                      ts.createLiteral(SCHEMA_DEFINITION_KEY),
                      ts.createIdentifier('__SchemaDefinition'),
                    ])
                  );
                }
              }
            }
          });

          (sourceFile.statements as any).unshift(
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
          );
        }

        return walker(sourceFile, ctx);
      };
    },
  };
}
