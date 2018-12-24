import * as ts from 'typescript';

export function walker(sourceFile: ts.SourceFile, ctx: ts.TransformationContext) {
  function visitor(node) {
    return ts.visitEachChild(node, visitor, ctx);
  }
  return ts.visitEachChild(sourceFile, visitor, ctx);
}
