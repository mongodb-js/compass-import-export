import fs from 'fs';
import peek from 'peek-stream';
import stream from 'stream';

const debug = require('./logger').createLogger('detect-import-file');


const DEFAULT_FILE_TYPE = 'json';

// TODO: Include more heuristics. Ideally the user just picks the file
// and we auto-detect the various formats/options.

function detectImportFile(fileName, done) {
  debug('peeking at', fileName);

  let fileType = DEFAULT_FILE_TYPE;
  let fileIsMultilineJSON = false;

  const source = fs.createReadStream(fileName, 'utf-8');
  const peeker = peek({ maxBuffer: 1024 }, function(data, swap) {
    const contents = data.toString('utf-8');
    debug('peek is', contents);
    if (contents[0] === '[' || contents[0] === '{') {
      fileType = 'json';
      if (contents[contents.length - 1] === '}') {
        fileIsMultilineJSON = true;
      }
    }

    if (/\.(csv)$/.test(fileName)) {
      fileType = 'csv';
    }

    // TODO: lucas: papaparse guessDelimiter

    debug('swapping');
    swap('done');
  });

  stream.pipeline(source, peeker, function(err) {
    if (err && err !== 'done') {
      debug('pipeline error', err);
      return done(err);
    }
    debug('detected', {
      fileName: fileName,
      fileIsMultilineJSON: fileIsMultilineJSON,
      fileType: fileType
    });
    return done(null, {
      fileName: fileName,
      fileIsMultilineJSON: fileIsMultilineJSON,
      fileType: fileType
    });
  });
}
export default detectImportFile;
