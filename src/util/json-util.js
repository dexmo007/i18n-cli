const fs = require('fs');
const glob = require('glob');
const path = require('path');
const editorconfig = require('editorconfig');

function getKeys(msgs) {
  return Object.entries(msgs).flatMap(([key, value]) => {
    if (typeof value === 'string' || !value) {
      return [key];
    }
    if (Array.isArray(value)) {
      return value.map((v, i) => `${key}[${i}]`);
    }
    // must be object
    return getKeys(value).map(childKey => `${key}.${childKey}`);
  });
}

/* eslint-disable no-param-reassign */
function parseToEntries(json, entries, prefix = '') {
  Object.entries(json).forEach(([key, value]) => {
    if (typeof value === 'string' || !value || Array.isArray(value)) {
      entries[prefix + key] = value;
    } else {
      // must be object
      parseToEntries(value, entries, `${prefix + key}.`);
    }
  });
} // or use dot.dot ?

function flatten(json) {
  const entries = {};
  parseToEntries(json, entries);
  return entries;
}

function loadFile(input) {
  const content = fs.readFileSync(input, { encoding: 'utf8' });
  const json = JSON.parse(content);
  const entries = {};
  parseToEntries(json, entries);
  return entries;
}

function nestEntries(entries) {
  const nested = {};
  const keysToNest = [];
  Object.entries(entries).forEach(([key, value]) => {
    const [first, ...rest] = key.split('.');
    if (rest.length === 0) {
      nested[first] = value;
    } else {
      if (!nested[first]) {
        nested[first] = {};
        keysToNest.push(first);
      }
      nested[first][rest.join('.')] = value;
    }
  });
  keysToNest.forEach((key) => {
    nested[key] = nestEntries(nested[key]);
  });
  return nested;
}

function hasSingleChild(obj) {
  return Object.keys(obj).length === 1;
}

function isSimple(value) {
  return !value || typeof value === 'string' || Array.isArray(value);
}

function unnestSingleChildren(entries) {
  if (isSimple(entries)) {
    return entries;
  }
  Object.entries(entries).forEach(([key, value]) => {
    if (isSimple(value)) {
      return;
    }
    if (hasSingleChild(value)) {
      const [[childKey, childValue]] = Object.entries(value);
      unnestSingleChildren(childValue);
      entries[`${key}.${childKey}`] = childValue;
      delete entries[key];
    } else {
      unnestSingleChildren(value);
    }
  });
  return entries;
}

function deepSorted(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      let value = obj[key];
      if (!isSimple(value)) {
        value = deepSorted(value);
      }
      sorted[key] = value;
    });
  return sorted;
}

function saveJson(target, json, config) {
  const indent = config.indent || editorconfig.parseSync(target).indent_size || 2;
  fs.writeFileSync(target, JSON.stringify(json, undefined, indent));
}

function getKeyRecursively(root, key, defaultLang) {
  const found = {};
  const langs = new Set([defaultLang]);
  glob.sync(path.join(root, '**', '??.json')).forEach((file) => {
    const msgs = loadFile(file);
    const lang = path.basename(file, '.json');
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
  getKeys,
  parseToEntries,
  loadFile,
  nestEntries,
  unnestSingleChildren,
  flatten,
  deepSorted,
  saveJson,
  getKeyRecursively,
};
