exports.command = 'test';
exports.describe = 'test';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  console.log(JSON.stringify(argv, undefined, 2));
};
