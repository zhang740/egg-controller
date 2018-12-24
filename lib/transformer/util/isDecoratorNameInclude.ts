export function isDecoratorNameInclude(node, decoratorName) {
  return (node.decorators || []).find(n => {
    try {
      return n.expression.expression.escapedText === decoratorName;
    } catch (error) {
      return false;
    }
  });
}
