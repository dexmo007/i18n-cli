const fs = require('fs');
const findUp = require('find-up');
// const merge = require('deepmerge');
const inquirer = require('inquirer');
const requireDirectory = require('require-directory');

// const defaultConfig = {
//   path: '.',
//   defaultLang: 'en',
//   sort: true,
//   unnestSingleChildren: true,
// };
const configPath = findUp.sync(['.i18nrc', '.i18nrc.json']);
const rcConfig = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};
// const config = merge(defaultConfig, rcConfig);

// .command(
//   'ls [path]',
//   'list info about an i18n directory',
//   (yargs) => {
//     yargs.positional('path', {
//       describe: 'path to folder to analyze',
//       default: '.',
//     });
//   },
//   ls,
// )

require('yargs')
  .config(rcConfig)
  .pkgConf('i18n')
  .commandDir('cmds')
  .command(
    '*',
    'select what to do from list',
    () => {},
    async (argv) => {
      const cmds = requireDirectory(module, './cmds');
      const { command } = await inquirer.prompt([
        {
          type: 'list',
          choices: Object.keys(cmds),
          message: 'What do you want to do?',
          name: 'command',
        },
      ]);
      await cmds[command].handler(argv);
    },
  )
  .option('sort', {
    type: 'boolean',
    desc: 'Whether to sort the keys in the message file alphabetically',
    default: true,
  })
  .option('indent', {
    type: 'number',
    desc:
      'The indentation size for the JSON files. Defaults to the value set in EditorConfig or 2.',
  })
  .option('default-lang', {
    default: 'en',
    describe: 'The default lang in your i18n configuration',
  })
  .option('unnest-only-children', {
    type: 'boolean',
    default: true,
    describe:
      'Whether to unnest only children in the resulting JSON, e.g. {"foo": {"bar": "value"}} -> {"foo.bar": "value"}',
  })
  .boolean('verbose') // todo implementation
  .help()
  .parse();
