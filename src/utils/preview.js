import { Writable } from 'stream';
import peek from 'peek-stream';
import createParser from './parsers';
import { flatten } from 'flat';
import { createLogger } from './logger';
const debug = createLogger('preview');

const warn = (msg, ...args) => {
  console.warn('compass-import-export:preview: ' + msg, args);
};

/**
 * Peek the first 20k of a file and parse it.
 *
 * @param {String} fileType csv|json
 * @returns {stream.Transform}
 */
export const createPeekStream = function(fileType) {
  return peek({ maxBuffer: 20 * 1024 }, function(data, swap) {
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

      if (this.fields.length === 0) {
        Object.keys(flat).map(k => {
          this.fields.push({
            path: k,
            checked: true,
            type: typeof flat[k]
          });
        });
        debug('set fields', this.fields);
      }

      const flattenedKeys = Object.keys(flat);

      // TODO: lucas: For JSON, use schema parser or something later to
      // handle sparse/polymorphic. For now, the world is pretty tabular.
      if (flattenedKeys.length !== this.fields.length) {
        warn('invariant detected!', {
          expected: this.fields.map(f => f.path),
          got: flattenedKeys
        });
      }

      const v = [];
      flattenedKeys.map(k => {
        v.push(flat[k]);
      });
      this.values.push(v);

      return next(null);
    }
  });
}
