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
    this.docsWritten = 0;
  }

  _write(chunk, encoding, next) {
    this.buf.push(chunk);
    if (this.buf.length === this.BATCH_SIZE) {
      return this.dataService.insertMany(
        this.ns,
        this.buf,
        { ordered: false },
        (err) => {
          this.docsWritten += this.buf.length;
          this.buf = [];
          if (err) {
            debug('error', err);
            return next(err);
          }
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
      debug('%d docs written', this.docsWritten);
      return;
    }
    debug('draining buffered docs', this.buf.length);

    this.dataService.insertMany(this.ns, this.buf, { ordered: false }, (
      err
    ) => {
      this.docsWritten += this.buf.length;
      this.buf = [];
      debug('buffer drained', err);
      debug('%d docs written', this.docsWritten);
      callback(err);
    });
  }
}

export default WritableCollectionStream;

export const createCollectionWriteStream = function(dataService, ns) {
  return new WritableCollectionStream(dataService, ns);
};
