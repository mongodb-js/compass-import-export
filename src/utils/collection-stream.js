/* eslint-disable no-console */
import { Writable } from 'stream';
import { createLogger } from './logger';
const backoff = require('backoff');
const debug = createLogger('collection-stream');

class WritableCollectionStream extends Writable {
  constructor(dataService, ns) {
    super({ objectMode: true });
    this.dataService = dataService;
    this.ns = ns;
    this.BATCH_SIZE = 1000;
    this.docsWritten = 0;
    this._initBatch();
    this._batchCounter = 0;
    this._stats = {
      nInserted: 0,
      nMatched: 0,
      nModified: 0,
      nRemoved: 0,
      nUpserted: 0,
      ok: 0,
      writeErrorCount: 0
    };

    this._errors = [];
  }

  _initBatch() {
    this.batch = this._collection().initializeOrderedBulkOp();
  }

  _collection() {
    return this.dataService.client._collection(this.ns);
  }

  _write(chunk, encoding, next) {
    this.batch.insert(chunk);
    if (this.batch.length === this.BATCH_SIZE) {
      // TODO: lucas: expose finer-grained bulk op results:
      // https://mongodb.github.io/node-mongodb-native/3.3/api/BulkWriteResult.html
      const nextBatch = (err, res = {}) => {
        this.docsWritten += this.batch.length;
        if (err) {
          debug('batch %s result', this._batchCounter, err, res);
        }
        this.captureStatsForBulkResult(err, res);

        this._batchCounter++;
        this._initBatch();
        next();
      };

      const execBatch = cb => {
        this.batch.execute(
          {
            w: 1
            // wtimeout: 0 /* 60 * 1000*/
          },
          (err, res) => {
            // TODO: lucas: Respect a `stopOnErrors` checkbox option.
            if (err) {
              if (err.errorLabels && Array.isArray(err.errorLabels)) {
                // TODO: lucas: In the case of a transientTransactionError
                // with DUPLICATE_KEYS, we need to reset generated the default
                // `_id: ObjectId()` in the batch before our next retry.
                err.message =
                  'NOTE: @lucas: this is a transient transaction error and will be retried. - ' +
                  err.message;
              }
              this._errors.push(err);
              return cb(err);
            }
            cb(null, res);
          }
        );
      };

      const call = backoff.call(execBatch, nextBatch);
      call.setStrategy(
        new backoff.ExponentialStrategy({
          randomisationFactor: 0,
          initialDelay: 500,
          maxDelay: 10000
        })
      );
      call.on('backoff', (number, delay) => {
        debug(
          'Batch %s retry #%s failed.  retrying in %sms...',
          this._batchCounter,
          number,
          delay
        );
      });
      call.failAfter(5);
      call.start();
      return;
    }
    next();
  }

  _final(callback) {
    debug('running _final()');

    if (this.batch.length === 0) {
      // debug('nothing left in buffer');
      debug('%d docs written', this.docsWritten);
      this.printJobStats();
      return callback();
    }
    debug('draining buffered docs', this.batch.length);
    this.batch.execute((err, res) => {
      this.captureStatsForBulkResult(err, res);
      this.docsWritten += this.batch.length;
      this.printJobStats();
      this.batch = null;
      // debug('buffer drained', err, res);
      debug('%d docs written', this.docsWritten);
      callback(err);
    });
  }

  captureStatsForBulkResult(err, res) {
    // TODO: lucas: Still have access to this._batch here.
    const keys = [
      'nInserted',
      'nMatched',
      'nModified',
      'nRemoved',
      'nUpserted',
      'ok'
    ];

    keys.forEach(k => {
      this._stats[k] += res[k] || 0;
    });
    if (!err) return;

    if (err.name === 'BulkWriteError') {
      this._errors.push.apply(this._errors, err.result.result.writeErrors);
      this._errors.push.apply(
        this._errors,
        err.result.result.writeConcernErrors
      );
      this._stats.writeErrorCount += err.result.result.writeErrors.length;
    }
  }

  printJobStats() {
    console.group('Import Info');
    console.table(this._stats);
    console.log('Errors Seen');
    console.log(this._errors);
    console.groupEnd();
  }
}

export const createCollectionWriteStream = function(dataService, ns) {
  return new WritableCollectionStream(dataService, ns);
};

export const createReadableCollectionStream = function(
  dataService,
  ns,
  spec = { filter: {} }
) {
  const { project, limit, skip } = spec;
  return dataService
    .fetch(ns, spec.filter || {}, { project, limit, skip })
    .stream();
};
