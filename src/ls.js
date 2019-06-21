const glob = require('glob');
const path = require('path');
const fs = require('fs');

function countKeys(msgs) {
  let count = 0;
  for (const [, value] of Object.entries(msgs)) {
    if (typeof value === 'string') {
      count += 1;
    } else if (Array.isArray(value)) {
      count += value.length;
    } else {
      // assume object
      count += countKeys(value);
    }
  }
  return count;
}

module.exports = (argv) => {
  const counts = {};
  const files = glob.sync(path.join(argv.path, '/**/??.json'));
  for (const file of files) {
    const lang = path.basename(file, '.json');
    const msgs = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
    if (!counts[lang]) {
      counts[lang] = 0;
    }
    counts[lang] += countKeys(msgs);
  }
  const defaultLang = argv['default-lang'];
  console.log(defaultLang, counts[defaultLang]);
  Object.entries(counts)
    .filter(([key]) => key !== defaultLang)
    .sort(([, c1], [, c2]) => (c1 < c2 ? 1 : -1))
    .forEach(([lang, count]) => {
      console.log(lang, count);
    });
};
