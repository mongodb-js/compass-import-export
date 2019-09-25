import csv from 'fast-csv';
import EJSON from 'mongodb-extended-json';
import Parser from 'JSONStream';
import { Transform } from 'stream';

export const createCSVParser = function() {
  return csv.parse({headers: true, ignoreEmpty: true});
};

export const createJSONParser = function() {
  return new Parser('*');
};

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
