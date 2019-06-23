const glob = require('glob');
const path = require('path');
const inquirer = require('inquirer');
const merge = require('deepmerge');
const emoji = require('node-emoji');
const {
  loadFile,
  nestEntries,
  unnestSingleChildren,
  flatten,
  deepSorted,
  saveJson,
} = require('../util/json-util');

exports.command = 'sync [path]';
exports.describe = 'sync keys in i18n files';
exports.builder = yargs => yargs
  .positional('path', {
    describe: 'path to the folder containing the i18n files',
    default: '.',
  })
  .option('base')
  .option('only')
  .coerce('only', s => s.split(','));

exports.handler = async (argv) => {
  const baseLang = argv.base || argv['default-lang'];
  // console.log(argv.only);
  const structure = {};
  const files = glob.sync(path.join(argv.path, '/**/??.json'));
  for (const file of files) {
    const filePath = path.dirname(file);
    const lang = path.basename(file, '.json');
    if (argv.only && !argv.only.includes(lang) && lang !== baseLang) {
      continue;
    }
    if (!structure[filePath]) {
      structure[filePath] = [];
    }
    structure[filePath].push(lang);
  }
  const currentMsgs = {};
  const questions = {};
  Object.entries(structure).forEach(([folder, langs]) => {
    const msgs = Object.fromEntries(
      langs.map(lang => [lang, loadFile(path.resolve(folder, `${lang}.json`))]),
    );
    currentMsgs[folder] = msgs;
    const base = msgs[baseLang];
    const baseKeys = Object.keys(base);
    delete msgs[baseLang];
    Object.entries(msgs).flatMap(([lang, localeMsgs]) => {
      const keys = new Set(baseKeys);
      Object.keys(localeMsgs).forEach(key => keys.delete(key));
      if (keys.size === 0) {
        return;
      }
      if (!questions[folder]) {
        questions[folder] = {};
      }
      questions[folder][lang] = {};
      keys.forEach((key) => {
        questions[folder][lang][key] = {
          question: {
            type: 'input',
            name: key,
            message: `Translate key '${key}' (${baseLang}: '${base[key]}') into ${lang}:`,
          },
        };
      });
    });
  });
  if (Object.keys(questions).length === 0) {
    console.log(emoji.get('sparkles'), ' All in sync. Nothing to do.');
    return;
  }
  const newMsgs = {};
  for (const [folder, langs] of Object.entries(questions)) {
    newMsgs[folder] = {};
    for (const [lang, keys] of Object.entries(langs)) {
      console.log(emoji.get('hammer'), ` Working on ${folder}/${lang}...`, keys);
      const translationQuestions = Object.values(keys).map(d => d.question);
      // eslint-disable-next-line no-await-in-loop
      newMsgs[folder][lang] = await inquirer.prompt(translationQuestions);
      const newNested = unnestSingleChildren(nestEntries(newMsgs[folder][lang]));
      console.log(newNested);
      // eslint-disable-next-line no-await-in-loop
      const answer = await inquirer.prompt([
        { type: 'confirm', name: 'save', message: 'Looks good? Save?' },
      ]);
      if (answer.save) {
        let merged = merge(currentMsgs[folder][lang], flatten(newMsgs[folder][lang]));
        merged = nestEntries(merged);
        if (argv.unnestSingleChildren) {
          merged = unnestSingleChildren(merged);
        }
        if (argv.sort) {
          merged = deepSorted(merged);
        }
        saveJson(`${folder}/${lang}.json`, merged, argv);
        console.log(emoji.get('sparkles'), ` Saved "${folder}/${lang}.json".`);
      } else {
        // console.log(emoji.get('x'), 'Discarded changes.');
        console.log(emoji.get('x'), ' Discarded changes.');
      }
    }
  }
};
