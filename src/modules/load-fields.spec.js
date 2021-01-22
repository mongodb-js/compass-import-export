import sinon from 'sinon';
import loadFields from './load-fields';

describe('loadFields', () => {
  const fakeDataService = (err, docs) => {
    return {
      find: sinon.spy((ns, query, options, cb) => {
        cb(err, docs);
      })
    };
  };

  it('folds all the fields from a set of documents', async() => {
    const dataService = fakeDataService(null, [{a: '1'}, {b: '2'}]);
    const fields = await loadFields(dataService, 'db1.coll1', {}, {});

    expect(fields).to.deep.equal({
      a: 1,
      b: 1
    });
  });

  it('folds nested fields', async() => {
    const dataService = fakeDataService(null, [{
      a: { b: '2' }
    }, {
      c: '3'
    }]);
    const fields = await loadFields(dataService, 'db1.coll1', {}, {});

    expect(fields).to.deep.equal({
      'a.b': 1,
      c: 1
    });
  });

  it('merges nested fields', async() => {
    const dataService = fakeDataService(null, [{
      a: { b: '2' }
    }, {
      a: { c: '3' }
    }]);
    const fields = await loadFields(dataService, 'db1.coll1', {}, {});

    expect(fields).to.deep.equal({
      'a.b': 1,
      'a.c': 1
    });
  });

  it('pass down arguments', async() => {
    const dataService = fakeDataService(null, []);
    await loadFields(dataService, 'db1.coll1', { x: 1 }, { maxTimeMs: 123 });

    expect(dataService.find).to.have.been.calledOnceWith('db1.coll1', {
      x: 1
    }, {
      limit: 50,
      maxTimeMs: 123
    });
  });
});
