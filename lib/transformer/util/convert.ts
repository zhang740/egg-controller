import * as ts from 'typescript';

export function convert(data: any) {
  return typeof data === 'string'
    ? ts.createStringLiteral(data)
    : typeof data === 'number'
    ? ts.createNumericLiteral(`${data}`)
    : ts.createObjectLiteral(
        Object.keys(data)
          .filter(key => data[key])
          .map(prop => {
            return ts.createPropertyAssignment(
              `"${prop}"`,
              typeof data[prop] === 'string'
                ? ts.createStringLiteral(data[prop])
                : Array.isArray(data[prop])
                ? ts.createArrayLiteral(
                    data[prop].map(item => convert(item)),
                    false
                  )
                : convert(data[prop])
            );
          }),
        false
      );
}
