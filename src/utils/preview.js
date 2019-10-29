import { Writable } from 'stream';
import peek from 'peek-stream';
import createParser from './parsers';

import { createLogger } from './logger';
const debug = createLogger('collection-stream');

/**
 * Peek transform that returns parser transform.
 *
 * @param {String} fileType csv|json
 * @returns {stream.Transform}
 */
export const createPeekStream = function(fileType) {
  return peek({ newline: false, maxBuffer: 64 * 1024 }, function(data, swap) {
    return swap(null, createParser({ fileType: fileType }));
  });
};

/**
 * Collects 10 parsed documents from createPeekStream().
 * @returns {stream.Writable}
 */
export default function({ MAX_SIZE = 10 } = {}) {
  return new Writable({
    objectMode: true,
    highWaterMark: MAX_SIZE,
    allowHalfOpen: false,
    write: function(doc, encoding, next) {
      if (!this.docs) {
        this.docs = [];
      }
      if (this.docs.length < MAX_SIZE) {
        debug('only have %d docs. Asking for more', this.docs.length);
        this.docs.push(doc);
        return next(null);
      }
      if (this.docs.length === MAX_SIZE) {
        debug('reached %d. done!', this.docs.length);
        return next();
      }
      debug('already have max docs.');
      return next();
    }
  });
}
