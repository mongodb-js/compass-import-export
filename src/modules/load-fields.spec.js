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
      all: {
        a: 1,
        b: 1
      },
      selectable: {
        a: 1,
        b: 1
      }
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
      all: {
        'a.b': 1,
        c: 1
      },
      selectable: {
        'a.b': 1,
        c: 1
      }
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
      all: {
        'a.b': 1,
        'a.c': 1
      },
      selectable: {
        'a.b': 1,
        'a.c': 1
      }
    });
  });

  it('truncates fields to maxDepth', async() => {
    const dataService = fakeDataService(null, [
      {
        a: { b: { c: { d: 'x' } }}
      }
    ]);

    const table = [
      [1, 'a'],
      [2, 'a.b'],
      [3, 'a.b.c']
    ];

    for (const [maxDepth, expected] of table) {
      const fields = await loadFields(
        dataService, 'db1.coll1', {maxDepth}, {});

      expect(fields).to.deep.equal({
        all: {
          'a.b.c.d': 1
        },
        selectable: {
          [expected]: 1
        }
      });
    }
  });

  it('works for docs with multiple fields', async() => {
    const dataService = fakeDataService(null, [
      {
        _id: '1',
        title: 'doc1',
        year: '2003'
      },
      {
        _id: '2',
        title: 'doc2',
        year: '2004'
      }
    ]);
    const fields = await loadFields(dataService, 'db1.coll1', {}, {});

    expect(fields).to.deep.equal({
      all: {
        _id: 1,
        title: 1,
        year: 1
      },
      selectable: {
        _id: 1,
        title: 1,
        year: 1
      }
    });
  });

  it('pass down arguments', async() => {
    const dataService = fakeDataService(null, []);
    await loadFields(dataService, 'db1.coll1', {
      filter: { x: 1 },
      sampleSize: 10,
      maxDepth: 3,
    }, {
      maxTimeMs: 123
    });

    expect(dataService.find).to.have.been.calledOnceWith(
      'db1.coll1',
      {
        x: 1
      },
      {
        limit: 10,
        maxTimeMs: 123
      }
    );
  });
});
