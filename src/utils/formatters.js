/* eslint-disable no-var */
/* eslint-disable callback-return */
import csv from 'fast-csv';
import { EJSON } from 'bson';
import { Transform } from 'stream';
var flatten = require('flat');

/**
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
export const createJSONFormatter = function({ brackets = true } = {}) {
  return new Transform({
    readableObjectMode: false,
    writableObjectMode: true,
    transform: function(doc, encoding, callback) {
      const s = EJSON.stringify(doc);
      if (this._counter === undefined) {
        this._counter = 0;
        if (brackets) {
          this.push('[');
        }
      }
      callback(null, s);
      this._counter++;
    },
    final: function(done) {
      if (brackets) {
        this.push(']');
      }
      done();
    }
  });
};
