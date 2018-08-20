const shell = require('child_process').execSync;

const package = require('../package.json');

shell(`git tag ${package.version}`);
shell(`git push`);
shell(`git push origin ${package.version}`);
