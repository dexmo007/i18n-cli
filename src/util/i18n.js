const ls = require('./ls');
const { loadFile } = require('./json-util');
const { getLang } = require('./lang');

function getKeyRecursively(root, key, defaultLang) {
  const found = {};
  const langs = new Set([defaultLang]);
  ls(root, { recursive: true }).forEach((file) => {
    const msgs = loadFile(file);
    const lang = getLang(file);
    langs.add(lang);
    if (msgs[key]) {
      if (!found[lang]) {
        found[lang] = [];
      }
      found[lang].push({
        source: file,
        translation: msgs[key],
      });
    }
  });
  if (Object.keys(found).length === 0) {
    return {
      exists: false,
      found,
      missing: [],
    };
  }
  const ambiguous = Object.entries(found).filter(([, vals]) => vals.length > 1);
  return {
    exists: true,
    found,
    ambiguous:
      ambiguous.length === 0
        ? undefined
        : ambiguous
          .map(([lang, translations]) => ({ lang, translations }))
          .reduce((acc, cur) => {
            acc[cur.lang] = cur.translations;
            return acc;
          }, {}),
    missing: [...langs].filter(l => !Object.keys(found).includes(l)),
  };
}

module.exports = {
  getKeyRecursively,
};
