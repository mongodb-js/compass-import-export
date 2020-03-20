import { Transform, PassThrough } from 'stream';
import bsonCSV, { getTypeDescriptorForValue } from './bson-csv';
import _ from 'lodash';

import { createLogger } from './logger';

const debug = createLogger('apply-import-type-and-projection');

/**
 * Transforms values based on what user selected in preview table.
 *
 * @param {any} data Some data you want to transform.
 * @param {Array} transform `[${dotnotation}, ${targetType}]`.
 * @param {Array} exclude `[${dotnotation}]`
 * @param {Boolean} removeBlanks Empty strings removed from document before insertion.
 * @param {String} keyPrefix Used internally when recursing into nested objects.
 * @returns {Object}
 */
function transformProjectedTypes(data, { transform = [[]], exclude = [], removeBlanks = false, keyPrefix = '' }) {
  if (Array.isArray(data)) {
    debug('data is an array');
    return data.map(function(doc) {
      return transformProjectedTypes(doc, { transform, exclude, removeBlanks, keyPrefix });
    });
  } else if (data === null || data === undefined) {
    debug('data is null or undefined');
    return data;
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    debug('empty document');
    return data;
  }
  const result = data;

  _.forEach(
    exclude,
    function(d) {
      if (exclude.indexOf(d) > -1) {
        _.unset(result, [d]);
        debug('dropped', d);
        return false;
      }

      return true;
    },
    {}
  );

  const lookup = _.fromPairs(transform);
  const lookupKeys = _.keys(lookup);
  console.log(lookup, lookupKeys);
  lookupKeys.forEach(function(keyPath) {
    const value = _.get(data, keyPath);
    if (removeBlanks && value === '') {
      debug('dropped blank field', value);
      _.unset(result, [keyPath]);
      return false;
    }
    const targetType = _.get(lookup, keyPath);
    const sourceType = getTypeDescriptorForValue(_.get(data, keyPath)).type;

    let casted = value;
    if (targetType !== sourceType) {
      casted = bsonCSV[targetType].fromString(value);
      // debug('Target type differs from source type. Casting.', {
      //   targetType,
      //   sourceType,
      //   value,
      //   keyPath,
      //   casted
      // });
    }

    _.set(result, keyPath, casted);
  });

  // debug('result', result);
  return result;
}

export default transformProjectedTypes;

/**
 * Use `transformProjectedTypes` in a stream.
 *
 * @param {spec} spec
 * @returns {TransformStream}
 */
export function transformProjectedTypesStream({ transform = [[]], exclude = [], removeBlanks = false }) {
  if (!Array.isArray(transform)) {
    throw new TypeError('spec.transform must be an array');
  }

  if (!Array.isArray(exclude)) {
    throw new TypeError('spec.exclude must be an array');
  }

  if (transform.length === 0 && exclude.length === 0 && removeBlanks === false) {
    debug('spec is a noop. passthrough stream');
    return new PassThrough({ objectMode: true });
  }

  debug('creating transform stream for spec', { transform, exclude, removeBlanks });
  return new Transform({
    objectMode: true,
    transform: function(doc, _encoding, cb) {
      const result = transformProjectedTypes(doc, { transform, exclude, removeBlanks});
      cb(null, result);
    }
  });
}
