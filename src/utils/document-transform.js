import { Transform } from 'stream';

import FILE_TYPES from 'constants/file-types';

class DocumentTransform extends Transform {
  constructor(type) {
    super({ writableObjectMode: true, encoding: 'utf8' });
    this.type = type;
    this.isFirstRecord = true;
  }

  _transform(chunk, encoding, callback) {
    const data = this.type === FILE_TYPES.JSON ? JSON.stringify(chunk) : this.toCSV(chunk, this.isFirstRecord);
    this.isFirstRecord = false;
    return callback(null, data + '\n');
  }

  toCSV(obj, withHeader) {
    let csv = withHeader ? Object.keys(obj).join(',') + '\n' : '';
    csv = csv.concat(
      Object.values(obj).map(v => typeof v === 'object' ? JSON.stringify(v) : v.toString()).join(',')
    );
    return csv;
  }
}

export default DocumentTransform;
