const stream = require('stream');
const Writable = stream.Writable;
const debug = require('./logger').createLogger('writable-collection-stream');

class WritableCollectionStream extends Writable {
  constructor(dataService, ns) {
    super({ objectMode: true});
    this.dataService = dataService;
    this.ns = ns;
    this.BATCH_SIZE = 1000;
    this.buf = [];
  }

  _write(chunk, encoding, next) {
    this.buf.push(chunk);
    if (this.buf.length === this.BATCH_SIZE) {
      debug('insertMany');
      return this.dataService.insertMany(
        this.ns,
        this.buf,
        { ordered: false },
        (err) => {
          this.buf = [];
          if (err) {
            debug('error', err);
            return next(err);
          }
          debug('success. next()');
          next();
        }
      );
    }
    next();
  }

  _final(callback) {
    debug('running _final()');
    if (this.buf.length === 0) {
      debug('nothing left in buffer');
      return;
    }
    debug('draining buffered docs', this.buf.length);

    this.dataService.insertMany(this.ns, this.buf, { ordered: false }, (
      err
    ) => {
      this.buf = [];
      debug('buffer drained', err);
      callback(err);
    });
  }
}

export default WritableCollectionStream;

export const createCollectionWriteStream = function(dataService, ns) {
  return new WritableCollectionStream(dataService, ns);
};
