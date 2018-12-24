import * as ts from 'typescript';

export function getTypeByKind(symbol: ts.Symbol) {
  switch ((symbol.valueDeclaration as any).type.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'string';
    case ts.SyntaxKind.NumberKeyword:
      return 'number';
    case ts.SyntaxKind.TypeLiteral:
      return '{}';
    default:
      return 'any';
  }
}
