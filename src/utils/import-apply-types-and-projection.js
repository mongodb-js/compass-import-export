import { Transform, PassThrough } from 'stream';

import bsonCSV from './bson-csv';
import isPlainObject from 'lodash.isplainobject';
import isObjectLike from 'lodash.isobjectlike';

import { createLogger } from './logger';

const debug = createLogger('apply-import-type-and-projection');

/**
 * @typedef spec
 * @property {Array} exclude - Array of dotnotation keys to remove from source document.
 * @property {Object} transform - `{dotnotationpath: targetTypeName}`
 */

/**
 * Transforms objects based on what user selected in preview table.
 *
 * @param {spec} spec
 * @param {any} data
 * @param {String} [keyPrefix] Used internally when recursing into nested objects.
 * @returns {Object}
 * TODO (lucas) make not disgusting. Update tests to use right transform type shap of arrays not object.!!!!!
 */
function transformProjectedTypes(spec, data, keyPrefix = '') {
  if (Array.isArray(data)) {
    debug('data is an array');
    return data.map(transformProjectedTypes.bind(null, spec));
  } else if (data === null || data === undefined) {
    debug('data is null or undefined');
    return data;
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    debug('empty doc');
    return data;
  }
  const result = keys.reduce(function(doc, key) {
    /**
     * TODO: lucas: Relocate removeEmptyStrings() here?
     * Avoid yet another recursive traversal of every document.
     */
    if (spec.exclude.includes(`${keyPrefix}${key}`)) {
      // Drop the key if unchecked
      debug('dropped excluded key', `${keyPrefix}${key}`);
      return doc;
    }
    if (!Array.isArray(spec.transform)) {
      throw new TypeError(
        `spec.transform must be an array. Got ${JSON.stringify(spec.transform)}`
      );
    }

    const trans = spec.transform.filter(function(f) {
      debug(
        'transform pick',
        f[0],
        `${keyPrefix}${key}`,
        f[0] === `${keyPrefix}${key}`
      );
      return f[0] === `${keyPrefix}${key}`;
    });

    if (trans.length > 1) {
      debug('Ach~! too many keys');
      throw new TypeError('Ach~! too many keys');
    }
    if (!trans || trans.length === 0 || trans[0].length === 0) {
      debug('no transforms found for key', `${keyPrefix}${key}`);
      doc[`${key}`] = data[key];
      return doc;
    }
    const [k, targetTypeName] = trans[0];

    debug('match!', k, targetTypeName);

    /**
     * TODO: (lucas) Add a `sourceType` to import fields so we can skip
     * casting actual noops like String -> String.
     */
    const toBSON = bsonCSV[targetTypeName];
    if (toBSON && !isObjectLike(data[k])) {
      doc[`${key}`] = toBSON.fromString(data[`${keyPrefix}${key}`]);
    } else {
      doc[`${key}`] = transformProjectedTypes(
        spec,
        data[key],
        `${keyPrefix}.`
      );
    }
    return doc;
  }, {});

  debug('result', result);
  return result;
}

export default transformProjectedTypes;

/**
 * Use `transformProjectedTypes` in a stream.
 *
 * @param {spec} spec
 * @returns {TransformStream}
 */
export function transformProjectedTypesStream(spec) {
  if (!Array.isArray(spec.transform)) {
    throw new TypeError('spec.transform must be an array');
  }
  if (!Array.isArray(spec.exclude)) {
    throw new TypeError('spec.exclude must be an array');
  }
  if (spec.transform.length === 0 && spec.exclude.length === 0) {
    debug('spec is a noop. passthrough stream');
    return new PassThrough({ objectMode: true });
  }

  debug('creating transform stream for spec', spec);
  return new Transform({
    objectMode: true,
    transform: function(doc, encoding, cb) {
      const result = transformProjectedTypes(spec, doc);
      cb(null, result);
    }
  });
}
