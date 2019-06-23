const path = require('path');
const inquirer = require('inquirer');
const emoji = require('node-emoji');
const { getAllLangsRecursively } = require('../util/lang');
const { lsd } = require('../util/ls');

exports.command = 'add <keys..>';
exports.describe = 'Add keys';
exports.builder = yargs => yargs.positional('keys', {
  type: 'array',
  demand: true,
  describe: 'The keys to add',
});

exports.handler = async (argv) => {
  const files = lsd(argv.path, { recursive: true });
  const { file } = await inquirer.prompt([
    {
      type: 'list',
      choices: [
        ...files.map(f => ({ name: f || '<root>', value: { type: 'existing', path: f } })),
        { name: 'Create New File', value: { type: 'new' } },
      ],
      message: 'To which do you wish to add the key',
      name: 'file',
    },
  ]);
  let directory;
  if (file.type === 'new') {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        message: 'In what directory (relative) do you want to save the new key',
        name: 'directory',
      },
    ]);
    directory = path.join(argv.path, answer.directory);
  } else {
    directory = path.dirname(file.path);
  }
  const langs = getAllLangsRecursively(argv.path, argv.defaultLang).filter(
    l => l !== argv.defaultLang,
  );

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
  console.log('saving to ', directory);
  console.log(msgs);
};
