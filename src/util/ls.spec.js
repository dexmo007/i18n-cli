const path = require('path');
const ls = require('./ls');
const { lsd } = require('./ls');

const root = path.resolve(__dirname, '../../test/i18n');
describe('ls on test/i18n', () => {
  it('should be empty on root level', () => {
    expect(ls(root)).toHaveLength(0);
  });

  it('should list subfolder', () => {
    const files = ls(path.join(root, 'bar'));
    expect(files.map(f => path.basename(f, '.json'))).toEqual(['de', 'en']);
  });

  it('should list all files recursively', () => {
    const files = ls(root, { recursive: true });
    expect(files).toEqual(['bar/de.json', 'bar/en.json', 'foo/en.json']);
  });
});

describe('lsd', () => {
  it('should list all root level directories', () => {
    const dirs = lsd(root);
    expect(dirs).toEqual(['bar', 'empty', 'foo']);
  });

  it('should list all directories recursively', () => {
    const dirs = lsd(root, { recursive: true });
    expect(dirs).toEqual(['', 'bar', 'empty', 'foo', 'foo/bar']);
  });
});
