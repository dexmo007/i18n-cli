const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const emoji = require('node-emoji');

exports.command = 'init [path]';
exports.describe = 'Initialize i18n';
exports.builder = yargs => yargs.positional('path', {
  desc: 'Path to the directory where i18n should be initialized',
  default: '.',
});

function isLang() {
  return true;
}

exports.handler = async (argv) => {
  console.log(emoji.get('rocket'), " Let's get this started...");
  const answers = await inquirer.prompt([
    {
      type: 'input',
      message: 'What should be your default language',
      name: 'defaultLang',
      default: argv.defaultLang,
    },
    {
      type: 'input',
      message: 'What other languages would you like to support',
      name: 'langs',
      default: [],
      filter: i => i.split(','),
      validate: langs => langs.every(l => isLang(l)),
    },
  ]);
  const langs = [answers.defaultLang, ...answers.langs];
  langs.forEach((lang) => {
    fs.writeFileSync(path.join(argv.path, `${lang}.json`), '{}');
  });

  // todo create rc file

  console.log(emoji.get('sparkles'), ' Done.');
};
