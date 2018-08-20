import { genAPISDK } from './util';

process.on('message', (message: {
  targetSDKDir: string, files: string[], templatePath: string, filter: string[], type: 'js' | 'ts'
}) => {
  try {
    const { targetSDKDir, files, templatePath, filter, type } = message;
    files.forEach(file => require(file));
    genAPISDK(targetSDKDir, templatePath, {
      type,
      filter: route => {
        return filter.some(r => {
          const match = r.match(new RegExp('^/(.*?)/([gimyu]*)$'));
          const regex = new RegExp(match[1], match[2]);
          return [].concat(route.url).some(url => regex.test(url.toString()));
        });
      }
    });
  } catch (error) {
    console.log('[GenSDK Error]', error);
  }
  process.exit(0);
});
process.send('gensdk:ready');
