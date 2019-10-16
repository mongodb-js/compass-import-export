import stripEmptyFields from './ignore-blank-fields';

describe('strip-empty-fields', () => {
  it('should remove empty strings', () => {
    const source = {
      _id: 1,
      empty: ''
    };
    const result = stripEmptyFields(source);
    expect(result).to.deep.equal({ _id: 1 });
  });

  it('should remove empty strings but leave falsy values', () => {
    const source = {
      _id: 1,
      empty: '',
      nulled: null,
      falsed: false,
      undef: undefined
    };
    const result = stripEmptyFields(source);
    expect(result).to.deep.equal({
      _id: 1,
      nulled: null,
      falsed: false,
      undef: undefined
    });
  });
});
