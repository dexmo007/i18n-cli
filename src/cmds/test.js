const { lsd } = require('../util/ls');

exports.command = 'test';
exports.describe = 'test';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  console.log(lsd(argv.path, { recursive: true }));
  // console.log(JSON.stringify(argv, undefined, 2));
};
