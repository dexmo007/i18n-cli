const emoji = require('node-emoji');
const Table = require('cli-table3');
const colors = require('colors');
const { getKeyRecursively } = require('../util/i18n');

exports.command = 'get <key>';
exports.describe = 'Gets all translations for a key';
exports.builder = yargs => yargs;

exports.handler = (argv) => {
  const result = getKeyRecursively(argv.path, argv.key, argv.defaultLang);
  if (!result.exists) {
    console.log(emoji.get('x'), ` Key '${argv.key}' not found in any files.`);
    process.exit(1);
    return;
  }
  if (result.ambiguous) {
    console.log('We found some ambiguous definitions:');
    Object.entries(result.ambiguous).forEach(([lang, translations]) => {
      console.log(lang);
      translations.forEach((t) => {
        console.log(`\t"${t.translation}" (found in "${t.source}")`);
      });
    });
    console.log('=============');
  }
  const table = new Table({
    head: ['Lang', 'Translation', 'Source'].map(h => colors.reset(h)),
  });
  table.push(
    ...Object.entries(result.found)
      .filter(([lang]) => !result.ambiguous || !result.ambiguous[lang])
      .flatMap(([lang, translations]) => translations.map(t => [lang, t]))
      .map(([lang, t]) => [lang, t.translation, t.source]),
  );
  console.log(table.toString());
  // .forEach(([lang, t]) => {
  //   console.log(lang, t.translation, `(found in "${t.source}")`);
  // });
  if (result.missing.length) {
    console.log('Translation is missing for these langs:', result.missing.join(', '));
  }
};
