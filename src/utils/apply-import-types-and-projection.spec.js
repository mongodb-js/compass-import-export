import apply from './apply-import-types-and-projection';

describe('apply-import-types-and-projection', () => {
  it('should include all fields by default', () => {
    const res = apply([{ path: '_id', checked: true, type: 'String' }], {
      _id: 'arlo'
    });
    expect(res).to.deep.equal({
      _id: 'arlo'
    });
  });
  it('should remove an unchecked path', () => {
    const res = apply(
      [
        { path: '_id', checked: true, type: 'String' },
        { path: 'name', checked: false, type: 'String' }
      ],
      {
        _id: 'arlo',
        name: 'Arlo'
      }
    );

    expect(res).to.deep.equal({
      _id: 'arlo'
    });
  });
  it('should deserialize strings to selected types', () => {
    const res = apply(
      [
        { path: '_id', checked: true, type: 'String' },
        { path: 'name', checked: true, type: 'String' },
        { path: 'birthday', checked: true, type: 'Date' }
      ],
      {
        _id: 'arlo',
        name: 'Arlo',
        birthday: '2014-09-21'
      }
    );

    expect(res).to.deep.equal({
      _id: 'arlo',
      name: 'Arlo',
      birthday: new Date('2014-09-21')
    });
  });
  it('should handle nested objects');
});
