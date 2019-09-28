import csv from 'fast-csv';
import { EJSON } from 'bson';
import { Transform } from 'stream';
var flatten = require('flat')

/**
 * TODO: Options for csv.format
 * @returns {Stream.Transform}
 */
export const createCSVFormatter = function() {
  return csv.format({
    headers: true,
    transform: (row) => flatten(row)
  });
};

/**
 * @returns {Stream.Transform}
 */
export const createJSONFormatter = function() {
  return new Transform({
    readableObjectMode: false,
    writableObjectMode: true,
    transform: function(doc, encoding, callback) {
      let s = EJSON.stringify(doc);
      if (this._counter === undefined) {
        this._counter = 0;
        s = `[${s}`;
      }
      this._counter++;
      callback(null, s);
    },
    final: function(done) {
      this.push(']');
      done();
    }
  });
};
