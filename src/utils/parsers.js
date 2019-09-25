import csv from 'fast-csv';
import EJSON from 'mongodb-extended-json';
import Parser from 'JSONStream';
import { Transform } from 'stream';

/**
 * TODO: Switch to papaparse for `dynamicTyping` of values
 * https://github.com/mholt/PapaParse/blob/5219809f1d83ffa611ebe7ed13e8224bcbcf3bd7/papaparse.js#L1216
 *
 * or implement it on fast-csv etc. could be nice so we
 * could easily support existing `.<bson_type>()` suffix as
 * `mongoimport` does today.
 */

/**
 * A transform stream that turns file contents in objects
 * quickly and smartly.
 *
 * @returns {Stream.Transform}
 */
export const createCSVParser = function() {
  return csv.parse({ headers: true, ignoreEmpty: true });
};

/**
 * A transform stream that converts a string of JSON
 * into an object or an array.
 *
 * @returns {Stream.Transform}
 */
export const createJSONParser = function() {
  return new Parser('*');
};

/**
 * A transform stream that always emits like `--jsonArray`
 * and deserializes any extended JSON objects into BSON.
 *
 * @returns {Stream.Transform}
 */
export const createEJSONDeserializer = function() {
  return new Transform({
    objectMode: true,
    transform: function(data, encoding, done) {
      const parsed = EJSON.deserialize(data);
      if (!Array.isArray(parsed)) {
        this.push(parsed);
      } else {
        for (let i = 0; i < parsed.length; i++) {
          this.push(parsed[i]);
        }
      }
      done();
    }
  });
};