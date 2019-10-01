import fs from 'fs';
import peek from 'peek-stream';
import stream from 'stream';

function detectImportFile(fileName, done) {
  let fileType = '';
  let fileIsMultilineJSON = false;

  const source = fs.createReadStream(fileName, 'utf-8');
  const peeker = peek({ maxBuffer: 1024 }, function(data, swap) {
    const contents = data.toString('utf-8');
    if (contents[0] === '[' || contents[0] === '{') {
      fileType = 'json';
      if (contents[contents.length - 1] === '}') {
        fileIsMultilineJSON = true;
      }
    }

    swap(null, new stream.PassThrough());
    // TODO: Include more heuristics. Ideally the user just picks the file
    // and we auto-detect the various formats/options.
  });

  stream.pipeline(source, peeker, function(err) {
    if (err) {
      return done(err);
    }
    return done(null, {
      fileName: fileName,
      fileIsMultilineJSON: fileIsMultilineJSON,
      fileType: fileType
    });
  });
}

export default detectImportFile;
