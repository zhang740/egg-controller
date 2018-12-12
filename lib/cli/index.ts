require('colorful').colorful();
import * as program from 'commander';
import { genAPISDK } from './gen_sdk';
let packageInfo = require('../../package.json');

program.version(packageInfo.version);

program
  .command('gensdk')
  .description('gen api sdk')
  .option('-p, --project <dir>', 'project dir')
  .action(function(options) {
    const baseDir = options.project || process.cwd();
    genAPISDK(baseDir)
      .then(_ => process.exit(0))
      .catch(error => console.log('Gen Error:\n', error));
  });

program.command('*').action(function() {
  program.help();
});

program.parse(process.argv);

let proc = program.runningCommand;
if (proc) {
  proc.on('close', process.exit.bind(process));
  proc.on('error', () => {
    process.exit(1);
  });
}

process.on('SIGINT', () => {
  if (proc) {
    proc.kill('SIGKILL');
  }
  process.exit(0);
});

if (!program.args || program.args.length < 1) {
  program.help();
}
