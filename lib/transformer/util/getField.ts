import * as ts from 'typescript';

export function getField(config: ts.Expression | undefined, fieldName: string) {
  const prop =
    config &&
    ts.isObjectLiteralExpression(config) &&
    config.properties.find(p => {
      return p.name && ts.isIdentifier(p.name) && p.name.escapedText === fieldName;
    });
  return prop && ts.isPropertyAssignment(prop) && prop;
}
