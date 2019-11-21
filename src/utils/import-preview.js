import { Writable } from 'stream';
import peek from 'peek-stream';
import createParser from './parsers';
import { flatten } from 'flat';
import { detectType } from './bson-csv';
import { createLogger } from './logger';
const debug = createLogger('import-preview');

const warn = (msg, ...args) => {
  // eslint-disable-next-line no-console
  console.warn('compass-import-export:import-preview: ' + msg, args);
};

/**
 * Peek the first 20k of a file and parse it.
 *
 * @param {String} fileType csv|json
 * @param {String} delimiter
 * @param {Boolean} fileIsMultilineJSON
 * @returns {stream.Transform}
 */
export const createPeekStream = function(
  fileType,
  delimiter,
  fileIsMultilineJSON
) {
  return peek({ maxBuffer: 20 * 1024 }, function(data, swap) {
    return swap(
      null,
      createParser({
        fileType: fileType,
        delimiter: delimiter,
        fileIsMultilineJSON: fileIsMultilineJSON
      })
    );
  });
};

/**
 * TODO: lucas: Preview could have partial objects if
 * spill over into next buffer. Can we back pressure against
 * the input source for real instead of this hacky impl?
 */

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
        return next();
      }
      this.docs.push(doc);

      // TODO: lucas: Don't unflatten bson internal props.
      const flat = flatten(doc);

      if (this.fields.length === 0) {
        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(flat)) {
          // TODO: lucas: Document this weird bug I found with my apple health data.
          key = key.replace(/[^\x00-\x7F]/g, '');
          this.fields.push({
            path: key,
            checked: true,
            type: detectType(value)
          });
        }
        debug('set fields', this.fields, { from: doc });
      }

      const flattenedKeys = Object.keys(flat);

      // TODO: lucas: For JSON, use schema parser or something later to
      // handle sparse/polymorphic. For now, the world is pretty tabular
      // and wait for user reports.
      if (flattenedKeys.length !== this.fields.length) {
        warn('invariant detected!', {
          expected: this.fields.map((f) => f.path),
          got: flattenedKeys
        });
      }
      this.values.push(Object.values(flat));

      return next(null);
    }
  });
}
