const path = require('path');
const ls = require('./ls');

function getLang(file) {
  return path.basename(file, '.json');
}

function getLangsInDir(dir) {
  return ls(dir).map(f => getLang(f));
}

function getAllLangsRecursively(root, defaultLang) {
  return [...new Set([defaultLang, ...ls(root, { recursive: true }).map(f => getLang(f))])];
}

module.exports = {
  getLang,
  getLangsInDir,
  getAllLangsRecursively,
};
