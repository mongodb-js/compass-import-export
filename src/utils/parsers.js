import { Transform } from 'stream';
import { parse as JSONParser } from 'JSONStream';
import { EJSON } from 'bson';
import csv from 'csv-parser';
import { createLogger } from './logger';
import parseJSON from 'parse-json';
import throttle from 'lodash.throttle';
import progressStream from 'progress-stream';
import bsonCSV from './bson-csv';

const debug = createLogger('parsers');

/**
 * TODO: lucas: Add papaparse `dynamicTyping` of values
 * https://github.com/mholt/PapaParse/blob/5219809f1d83ffa611ebe7ed13e8224bcbcf3bd7/papaparse.js#L1216
 */

/**
 * TODO: lucas: csv mapHeaders option to support existing `.<bson_type>()` caster
 * like `mongoimport` does today.
 */

/**
 * A transform stream that turns file contents in objects
 * quickly and smartly.
 *
 * @returns {Stream.Transform}
 */
export const createCSVParser = function({ delimiter = ',' } = {}) {
  return csv({
    strict: true,
    separator: delimiter
  });
};

/**
 * TODO: lucas: dot notation.
 */
function getProjection(previewFields, key) {
  return previewFields.filter((f) => {
    return f.path === key;
  })[0];
}

function transformProjectedTypes(previewFields, data) {
  if (Array.isArray(data)) {
    return data.map(transformProjectedTypes.bind(null, previewFields));
  } else if (typeof data !== 'object' || data === null || data === undefined) {
    return data;
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return data;
  }
  return keys.reduce(function(doc, key) {
    const def = getProjection(previewFields, key);

    // TODO: lucas: Relocate removeEmptyStrings() here?
    // Avoid yet another recursive traversal of every document.
    if (def && !def.checked) {
      debug('dropping unchecked key', key);
      return;
    }

    // TODO: lucas: Handle extended JSON case.
    if (
      def.type &&
      bsonCSV[def.type] &&
      data[key].prototype.constructor.toString().indexOf('Object') === -1 &&
      !Array.isArray(data[key])
    ) {
      doc[key] = bsonCSV[def.type].fromString(data[key]);
    } else {
      doc[key] = transformProjectedTypes(previewFields, data[key]);
    }
    return doc;
  }, {});
}

/**
 * A transform stream that parses JSON strings and deserializes
 * any extended JSON objects into BSON.
 *
 * @param {String} [selector] `null` for ndjson or `'*'` for JSON array. [default '*']
 * @param {String} [fileName] [default 'import.json']
 * @returns {Stream.Transform}
 */
export const createJSONParser = function({
  selector = '*',
  fileName = 'import.json'
} = {}) {
  debug('creating json parser with selector', selector);
  let lastChunk = '';
  const parser = new JSONParser(selector);
  const stream = new Transform({
    writableObjectMode: false,
    readableObjectMode: true,
    transform: function(chunk, enc, cb) {
      lastChunk = chunk;
      parser.write(chunk);
      cb();
    }
  });

  parser.on('data', (d) => {
    const doc = EJSON.deserialize(d, {
      promoteValues: true,
      bsonRegExp: true
    });
    stream.push(doc);
  });

  parser.on('error', function(err) {
    try {
      parseJSON(lastChunk.toString('utf-8'), EJSON.deserialize, fileName);
      // TODO: lucas: yeah having 2 json parses is weird
      // and could be an edge case here, but deal with it later.
    } catch (e) {
      debug('error parsing JSON', e);
      debug('original JSONStream error', err);
      stream.emit('error', e);
    } finally {
      lastChunk = '';
    }
  });

  parser.on('end', stream.emit.bind(stream, 'end'));

  return stream;
};

// TODO: lucas: move progress to its own module?

export const createProgressStream = function(fileSize, onProgress) {
  const progress = progressStream({
    objectMode: true,
    length: fileSize / 800,
    time: 500
  });

  // eslint-disable-next-line camelcase
  function update_import_progress_throttled(info) {
    // debug('progress', info);
    // dispatch(onProgress(info.percentage, dest.docsWritten));
    onProgress(null, info);
  }
  const updateProgress = throttle(update_import_progress_throttled, 500);
  progress.on('progress', updateProgress);
  return progress;
};

/**
 * Convenience for creating the right parser transform stream in a single call.
 *
 * @param {String} fileName
 * @param {String} fileType `csv` or `json`
 * @param {String} delimiter See `createCSVParser()`
 * @param {Boolean} fileIsMultilineJSON
 * @returns {stream.Transform}
 */
function createParser({
  fileName = 'myfile',
  fileType = 'json',
  delimiter = ',',
  fileIsMultilineJSON = false
} = {}) {
  if (fileType === 'csv') {
    return createCSVParser({
      delimiter: delimiter
    });
  }
  return createJSONParser({
    selector: fileIsMultilineJSON ? null : '*',
    fileName: fileName
  });
}

export default createParser;
