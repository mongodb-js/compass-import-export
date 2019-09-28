import csv from 'fast-csv';
import { EJSON } from 'bson';
import { Transform } from 'stream';

/**
 * TODO: Options for csv.format
 * @returns {Stream.Transform}
 */
export const createCSVFormatter = function() {
  return csv.format({});
};

/**
 * @returns {Stream.Transform}
 */
export const createJSONFormatter = function() {
  return new Transform({
    transform: function(doc, encoding, callback) {
      this.push(EJSON.stringify(doc));
      callback();
    }
  });
};
