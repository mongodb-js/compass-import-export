import { Transform } from 'stream';

const kSource = global.Symbol('source');

class SplitLines extends Transform {
  constructor() {
    super({ writableObjectMode: true, readableObjectMode: true });
    this[kSource] = '';
  }

  isLastLineComplete(line) {
    try {
      JSON.parse(line);
    } catch (e) {
      return false;
    }
    return true;
  }

  _transform(chunk, encoding, callback) {
    this[kSource] = this[kSource].concat(chunk);
    if (this[kSource].indexOf('\n') > -1) {
      const lines = this[kSource]
        .split('\n')
        .filter(Boolean);

      if (this.isLastLineComplete(lines[lines.length - 1])) {
        this[kSource] = '';
        return callback(null, lines.map(JSON.parse));
      }
      const linesToWrite = lines.splice(0, lines.length - 1);
      this[kSource] = lines[0];
      return callback(null, linesToWrite.map(JSON.parse));
    }
  }
}

export default SplitLines;
