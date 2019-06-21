exports.command = 'remove <keys..>';
exports.aliases = ['rm'];
exports.describe = 'test';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  console.log(JSON.stringify(argv, undefined, 2));
};
