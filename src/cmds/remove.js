exports.command = 'remove <keys..>';
exports.aliases = ['rm'];
exports.describe = 'test';
exports.builder = yargs => yargs.option('yes', {
  desc: 'Remove without confirmation',
  alias: 'y',
  type: 'boolean',
  default: false,
});

exports.handler = (argv) => {
  console.log(JSON.stringify(argv, undefined, 2));
};
