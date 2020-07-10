import * as ts from 'typescript';

export function getDecoratorName(node: ts.Decorator) {
  return ts.isIdentifier(node.expression)
    ? node.expression.escapedText
    : ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression)
    ? node.expression.expression.escapedText
    : '';
}
