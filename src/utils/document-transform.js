import { Transform } from 'stream';

class DocumentTransform extends Transform {
  constructor() {
    super({ writableObjectMode: true, encoding: 'utf8' });
  }

  _transform(chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk) + '\n');
  }
}

export default DocumentTransform;
