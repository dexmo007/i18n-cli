const path = require('path');
const glob = require('glob');

/**
 * lists all files in side the directory specified by the 'root' parameter
 * @param root the root directory to list
 * @param options.langs list only files for these langs, per default all langs are listed
 * @param options.recursive whether to list files recursively or top-level, defaults to false
 */
module.exports = (root, options) => {
  // eslint-disable-next-line no-param-reassign
  options = options || {};
  const fileNamePattern = options.langs ? `@(${options.langs.join('|')})` : '??';
  let pattern;
  if (options.recursive) {
    pattern = path.join(root, '**', `${fileNamePattern}.json`);
  } else {
    pattern = path.join(root, `${fileNamePattern}.json`);
  }
  return glob.sync(pattern).map(f => path.relative(root, f));
};

module.exports.lsd = (root, options) => {
  // eslint-disable-next-line no-param-reassign
  options = options || {};
  let pattern;
  if (options.recursive) {
    pattern = path.join(root, '**/');
  } else {
    pattern = path.join(root, '*/');
  }
  return glob.sync(pattern).map(f => path.relative(root, f));
};
