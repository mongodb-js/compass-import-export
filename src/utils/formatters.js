import csv from 'fast-csv';
import EJSON from 'mongodb-extended-json';
import { Transform } from 'stream';

/**
 * TODO: Options for csv.format
 */
export const createCSVFormatter = function() {
  return csv.format({});
};

export const createJSONFormatter = function() {
  return new Transform({
    transform: function(doc, encoding, callback) {
      this.push(EJSON.stringify(doc));
      callback();
    }
  });
};
