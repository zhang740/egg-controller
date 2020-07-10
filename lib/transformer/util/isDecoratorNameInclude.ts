import * as ts from 'typescript';

export function isDecoratorNameInclude(node: ts.Node, decoratorName: string) {
  return (
    node.decorators &&
    node.decorators.find(n => {
      try {
        return (
          ts.isCallExpression(n.expression) &&
          ts.isIdentifier(n.expression.expression) &&
          n.expression.expression.escapedText === decoratorName
        );
      } catch (error) {
        return false;
      }
    })
  );
}
