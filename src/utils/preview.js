import { Writable } from 'stream';
import peek from 'peek-stream';
import createParser from './parsers';
import { flatten } from 'flat';
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
        this.fields = [];
        this.values = [];
      }

      if (this.docs.length >= MAX_SIZE) {
        // debug('reached %d. done!', this.docs.length);
        return next();
      }
      this.docs.push(doc);

      // TODO: lucas: Don't unflatten bson internal props.
      const flat = flatten(doc);

      // TODO: lucas: Handle sparse/polymorphic json
      if (this.fields.length === 0) {
        debug('Setting fields');
        debug('flat doc', flat);
        debug('source doc', doc);
        Object.keys(flat).map(k => {
          this.fields.push({
            path: k,
            checked: true,
            type: typeof flat[k]
          });
        });
        debug('fields', this.fields);
      }

      const v = [];
      Object.keys(flat).map(k => {
        v.push(flat[k]);
      });
      debug('add values', v);
      this.values.push(v);

      return next(null);
    }
  });
}
