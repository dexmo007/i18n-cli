exports.command = 'update <key>';
exports.aliases = ['set'];
exports.describe = 'test';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  console.log(JSON.stringify(argv, undefined, 2));
};
