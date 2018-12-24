import * as crypto from 'crypto';

export function getHashCode(data: any) {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest()
    .toString('base64')
    .toLowerCase();
}
