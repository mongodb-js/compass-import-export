import { Transform } from 'stream';
import { Buffer } from 'buffer';

class DocumentTransform extends Transform {
  constructor() {
    super({ writableObjectMode: true, encoding: 'utf8' });
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer = this.buffer.concat(JSON.stringify(chunk) + '\n');
    if (Buffer.byteLength(this.buffer, 'utf-8') >= 2097152) {
      const data = this.buffer;
      this.buffer = '';
      return callback(null, data);
    }
    return callback();
  }

  _flush(callback) {
    return callback(this.buffer);
  }
}

export default DocumentTransform;
