import { Transform } from 'stream';

import bsonCSV from './bson-csv';
import { createLogger } from './logger';

const debug = createLogger('aplly-import-type-and-projection');

/**
 * TODO: lucas: dot notation: Handle extended JSON case.
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

export default transformProjectedTypes;

/**
 * TODO: lucas: Add detection for nothing unchecked and all fields
 * are default type and return a PassThrough.
 */

export function transformProjectedTypesStream(previewFields) {
  return new Transform({
    objectMode: true,
    transform: function(doc, encoding, cb) {
      cb(null, transformProjectedTypes(previewFields, doc));
    }
  });
}
