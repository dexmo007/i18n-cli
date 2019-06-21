const path = require('path');
const glob = require('glob');
const inquirer = require('inquirer');
const emoji = require('node-emoji');
const { getLangsInDir } = require('../util');

exports.command = 'add <keys..>';
exports.describe = 'Add keys';
exports.builder = yargs => yargs.positional('keys', {
  type: 'array',
  demand: true,
  describe: 'The keys to add',
});

exports.handler = async (argv) => {
  const files = glob.sync(path.join(argv.path, '**', `${argv.defaultLang}.json`));
  let file;
  if (files.length === 1) {
    [file] = files;
  } else {
    ({ file } = await inquirer.prompt([
      {
        type: 'list',
        choices: files,
        message: 'To which do you wish to add the key',
        name: 'file',
      },
    ]));
  }
  const langs = getLangsInDir(path.dirname(file)).filter(l => l !== argv.defaultLang);

  const msgs = {};
  for (const key of argv.keys) {
    console.log(emoji.get('hammer'), ` Working on '${key}'`);
    // eslint-disable-next-line no-await-in-loop
    const translations = await inquirer.prompt([
      {
        type: 'input',
        message: `What's the '${argv.defaultLang}' value (default)?`,
        name: argv.defaultLang,
      },
      ...langs.map(l => ({
        type: 'input',
        message: `What's the '${l}' value?`,
        name: l,
      })),
    ]);
    Object.entries(translations).forEach(([lang, value]) => {
      if (!msgs[lang]) {
        msgs[lang] = {};
      }
      msgs[lang][key] = value;
    });
  }

  console.log(msgs);
};
