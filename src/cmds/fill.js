exports.command = 'fill';
exports.describe = 'Fills empty values in all files';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  console.log(JSON.stringify(argv, undefined, 2));
};
