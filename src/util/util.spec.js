const { getKeys, parseToEntries, nestEntries, unnestSingleChildren } = require('./json-util');

describe('util/getKeys', () => {
  it('should work', () => {
    expect(
      getKeys({
        foo: 'bar',
        nest: {
          some: 'val',
          another: 'val',
        },
        list: ['one', 'two'],
      }),
    ).toEqual(['foo', 'nest.some', 'nest.another', 'list[0]', 'list[1]']);
  });
});

describe('util/parseToEntries', () => {
  it('should work', () => {
    const entries = {};
    parseToEntries(
      {
        foo: 'bar',
        nest: {
          some: 'val',
          another: 'val',
        },
        list: ['one', 'two'],
      },
      entries,
    );
    expect(entries).toEqual({
      foo: 'bar',
      'nest.some': 'val',
      'nest.another': 'val',
      list: ['one', 'two'],
    });
    expect(nestEntries(entries)).toEqual({
      foo: 'bar',
      nest: {
        some: 'val',
        another: 'val',
      },
      list: ['one', 'two'],
    });
  });

  it('should work 2', () => {
    expect(
      nestEntries({
        navigation: 'Navigation',
        'admin.user': 'User',
        'admin.add': 'Add',
      }),
    ).toEqual({ navigation: 'Navigation', admin: { user: 'User', add: 'Add' } });
  });
});

describe('util/unnestSingleChildren', () => {
  it('should work', () => {
    expect(
      unnestSingleChildren({
        foo: {
          bar: 'value',
        },
        scalar: 'string',
        arr: ['a', 'b'],
      }),
    ).toEqual({ 'foo.bar': 'value', scalar: 'string', arr: ['a', 'b'] });
  });

  it('should work 2', () => {
    expect(
      unnestSingleChildren({ navigation: 'Navigation', admin: { user: 'User', add: 'Add' } }),
    ).toEqual({ navigation: 'Navigation', admin: { user: 'User', add: 'Add' } });
  });
});
