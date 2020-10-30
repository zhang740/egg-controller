import * as ts from 'typescript';
import { SchemasObject, SchemaObject } from 'openapi3-ts';
import { getSchemaByType, TypeCache } from '../util/getSchemaByType';
import { convert } from '../util/convert';
import { getValue, walker, getClsMethodKey, NodeTransformer, getDecoratorName } from '../util';
import { hasField } from '../util';
import { getField } from '../util';

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
        return walker(sourceFile, ctx, before(ctx, sourceFile, typeChecker));
      };
    },

    after(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        return walker(sourceFile, ctx, after(ctx, sourceFile, typeChecker));
      };
    },
  };
}

export function before(
  _: ts.TransformationContext,
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
): NodeTransformer {
  // 当前编译文件需要保存的数据
  const fileData = (METADATA[sourceFile.fileName] = {
    // 方法定义
    methodDefine: {},
    schemaObjects: {},
    typeCache: [],
  });

  return (node: ts.Node) => {
    if (
      !ts.isDecorator(node) ||
      getDecoratorName(node) !== 'route' ||
      !ts.isCallExpression(node.expression)
    ) {
      return node;
    }
    const decoratorFactory = node.expression;

    const methodNode = node.parent;
    const clsNode = node.parent.parent;
    if (!ts.isClassDeclaration(clsNode) || !ts.isMethodDeclaration(methodNode)) {
      return node;
    }

    const clsName = clsNode.name.text;
    const clsMethod = getClsMethodKey(clsNode.name.text, methodNode.name.getText());

    const lastArg =
      decoratorFactory.arguments.length &&
      decoratorFactory.arguments[decoratorFactory.arguments.length - 1];

    const oldConfigArg = lastArg && ts.isObjectLiteralExpression(lastArg) && lastArg;
    const oldSchemasProp = getField(oldConfigArg, 'schemas');
    const oldSchemasPropObj = oldSchemasProp && oldSchemasProp.initializer;

    const config = {
      typeChecker,
      schemaObjects: fileData.schemaObjects,
      typeCache: fileData.typeCache,
    };

    const type = typeChecker.getTypeAtLocation(methodNode);
    const callSignatures = type.getCallSignatures()[0];

    const appendProps = [];

    // params parser
    if (!hasField(oldSchemasPropObj, 'requestBody')) {
      try {
        const parameters = callSignatures.getParameters();
        const paramSchema = parameters.reduce((s, p) => {
          const paramType = typeChecker.getTypeAtLocation(p.valueDeclaration);
          s[`${p.escapedName}`] = getSchemaByType(paramType, config);
          return s;
        }, {});
        appendProps.push(
          ts.createPropertyAssignment(
            'requestBody',
            convert({ type: 'object', properties: paramSchema })
          )
        );
      } catch (error) {
        console.log('warn:', `parse ${clsName}.${clsMethod} params fail!`, error);
      }
    }

    // returnType parser
    if (!hasField(oldSchemasPropObj, 'response')) {
      try {
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
        appendProps.push(ts.createPropertyAssignment('response', convert(responseSchema)));
      } catch (error) {
        console.log('warn:', `parse ${clsName}.${clsMethod} returnType fail!`, error);
      }
    }

    // reference type define
    if (!hasField(oldSchemasPropObj, 'components')) {
      appendProps.push(
        ts.createPropertyAssignment('components', ts.createIdentifier('__SchemaDefinition'))
      );
    }

    const schemasProp = oldSchemasProp
      ? ts.updatePropertyAssignment(
          oldSchemasProp,
          ts.createIdentifier('schemas'),
          ts.createObjectLiteral(
            [
              ...(ts.isObjectLiteralExpression(oldSchemasProp.initializer)
                ? oldSchemasProp.initializer.properties
                : []),
              ...appendProps,
            ],
            false
          )
        )
      : ts.createPropertyAssignment('schemas', ts.createObjectLiteral(appendProps, false));

    return ts.updateDecorator(
      node,
      ts.updateCall(decoratorFactory, decoratorFactory.expression, decoratorFactory.typeArguments, [
        ...decoratorFactory.arguments.filter(arg => arg !== oldConfigArg),
        oldConfigArg
          ? ts.updateObjectLiteral(oldConfigArg, [...oldConfigArg.properties, schemasProp])
          : ts.createObjectLiteral([schemasProp], false),
      ])
    );
  };
}

export function after(
  _: ts.TransformationContext,
  sourceFile: ts.SourceFile,
  __: ts.TypeChecker
): NodeTransformer {
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

  return node => node;
}
