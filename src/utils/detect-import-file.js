import fs from 'fs';
import peek from 'peek-stream';
import stream from 'stream';

const debug = require('./logger').createLogger('detect-import-file');


const DEFAULT_FILE_TYPE = 'json';

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

    debug('swapping');
    swap('done');
    // TODO: Include more heuristics. Ideally the user just picks the file
    // and we auto-detect the various formats/options.
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

// TODO: lucas
// function guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
//     var bestDelim, bestDelta, fieldCountPrevRow, maxFieldCount;

//     delimitersToGuess = delimitersToGuess || [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];

//     for (var i = 0; i < delimitersToGuess.length; i++) {
//         var delim = delimitersToGuess[i];
//         var delta = 0, avgFieldCount = 0, emptyLinesCount = 0;
//         fieldCountPrevRow = undefined;

//         var preview = new Parser({
//             comments: comments,
//             delimiter: delim,
//             newline: newline,
//             preview: 10
//         }).parse(input);

//         for (var j = 0; j < preview.data.length; j++) {
//             if (skipEmptyLines && testEmptyLine(preview.data[j])) {
//                 emptyLinesCount++;
//                 continue;
//             }
//             var fieldCount = preview.data[j].length;
//             avgFieldCount += fieldCount;

//             if (typeof fieldCountPrevRow === 'undefined') {
//                 fieldCountPrevRow = fieldCount;
//                 continue;
//             }
//             else if (fieldCount > 0) {
//                 delta += Math.abs(fieldCount - fieldCountPrevRow);
//                 fieldCountPrevRow = fieldCount;
//             }
//         }

//         if (preview.data.length > 0)
//             avgFieldCount /= (preview.data.length - emptyLinesCount);

//         if ((typeof bestDelta === 'undefined' || delta <= bestDelta)
//             && (typeof maxFieldCount === 'undefined' || avgFieldCount > maxFieldCount) && avgFieldCount > 1.99) {
//             bestDelta = delta;
//             bestDelim = delim;
//             maxFieldCount = avgFieldCount;
//         }
//     }

//     _config.delimiter = bestDelim;

//     return {
//         successful: !!bestDelim,
//         bestDelimiter: bestDelim
//     };
// }
export default detectImportFile;
