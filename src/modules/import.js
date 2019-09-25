import fs from 'fs';
import PROCESS_STATUS from 'constants/process-status';
import { appRegistryEmit } from 'modules/app-registry';
import stream from 'stream';

import { createLogger } from 'utils/logger';
import { createCollectionWriteStream } from 'utils/writable-collection-stream';
import { createCSVParser } from 'utils/parsers';

const debug = createLogger('import');


/**
 * ## Action names
 */
const PREFIX = 'import-export/import';
const IMPORT_STARTED = `${PREFIX}/STARTED`;
const IMPORT_CANCELLED = `${PREFIX}/CANCELLED`;
const IMPORT_PROGRESS = `${PREFIX}/PROGRESS`;
const IMPORT_FINISHED = `${PREFIX}/FINISHED`;
const IMPORT_FAILED = `${PREFIX}/FAILED`;
const IMPORT_FILE_TYPE_SELECTED = `${PREFIX}/FILE_TYPE_SELECTED`;
const IMPORT_FILE_SELECTED = `${PREFIX}/FILE_SELECTED`;
const OPEN_IMPORT = `${PREFIX}/OPEN`;
const CLOSE_IMPORT = `${PREFIX}/CLOSE`;

/**
 * Initial state.
 */
const INITIAL_STATE = {
  isOpen: false,
  progress: 0,
  error: null,
  fileName: '',
  fileType: undefined,
  status: PROCESS_STATUS.UNSPECIFIED,
  fileStats: null,
  docsWritten: 0
};

/**
 * Select the file type of the import.
 *
 * @param {String} fileType - The file type.
 *
 * @returns {Object} The action.
 */
export const selectImportFileType = (fileType) => ({
  type: IMPORT_FILE_TYPE_SELECTED,
  fileType: fileType
});

/**
 * Open the import modal.
 *
 * @returns {Object} The action.
 */
export const openImport = () => ({
  type: OPEN_IMPORT
});

/**
 * Close the import modal.
 *
 * @returns {Object} The action.
 */
export const closeImport = () => ({
  type: CLOSE_IMPORT
});

const updateProgress = (progress) => ({
  type: IMPORT_PROGRESS,
  progress: progress,
  error: null
});

const importStarted = (source, dest) => ({
  type: IMPORT_STARTED,
  source: source,
  dest: dest
});

const importFinished = () => ({
  type: IMPORT_FINISHED
});

const importFailed = (error) => ({
  type: IMPORT_FAILED,
  error: error
});

/**
 * The import module reducer.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The state.
 */
const reducer = (state = INITIAL_STATE, action) => {
  if (action.type === IMPORT_FILE_SELECTED) {
    return {
      ...state,
      fileName: action.fileName,
      fileStats: action.fileStats
    };
  }

  if (action.type === IMPORT_FAILED) {
    return {
      ...state,
      error: action.error,
      progress: 100,
      status: PROCESS_STATUS.FAILED
    };
  }

  if (action.type === IMPORT_STARTED) {
    return {
      ...state,
      error: null,
      progress: 0,
      status: PROCESS_STATUS.STARTED
    };
  }

  if (action.type === IMPORT_PROGRESS) {
    return {
      ...state,
      progress: Number(action.progress.toFixed(2))
    };
  }

  if (action.type === IMPORT_FINISHED) {
    const isComplete = !(state.error || state.status === PROCESS_STATUS.CANCELED);
    return {
      ...state,
      progress: 100,
      // isOpen: !isComplete,
      status: (isComplete) ? PROCESS_STATUS.COMPLETED : state.status,
      source: undefined,
      dest: undefined
    };
  }

  if (action.type === IMPORT_CANCELLED) {
    return {
      ...state,
      progress: 100,
      // isOpen: !isComplete,
      status: PROCESS_STATUS.CANCELED,
      source: undefined,
      dest: undefined
    };
  }

  /**
   * Open the `<ImportModal />`
   */
  if (action.type === OPEN_IMPORT) {
    return {
      ...INITIAL_STATE,
      isOpen: true
    };
  }

  if (action.type === CLOSE_IMPORT) {
    return {
      ...state,
      isOpen: false
    };
  }

  if (action.type === IMPORT_FILE_TYPE_SELECTED) {
    return {
      ...state,
      fileType: action.fileType
    };
  }
  return state;
};

export const startImport = () => {
  return (dispatch, getState) => {
    const state = getState();
    const { ns, dataService: { dataService }, importData } = state;
    const { fileName, fileType, fileStats: { size } } = importData;
    const source = fs.createReadStream(fileName, 'utf8');
    
    const progress = new stream.Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        debug('progress', source.bytesRead, size);
        updateProgress(source.bytesRead / size);
        callback(null, chunk);
      }
    });

    let parser;
    if (fileType === 'csv') {
      parser = createCSVParser();
    } else {
      throw new Error('json next.');
    }

    const dest = createCollectionWriteStream(dataService, ns);
    debug('executing pipeline');

    dispatch(importStarted(source, dest));
    stream.pipeline(source, parser, progress, dest, function(err, res) {
      if (err) {
        return dispatch(importFailed(err));
      }
      debug('done', err, res);
      dispatch(importFinished());
      dispatch(appRegistryEmit('import-finished', size, fileType));
    });
  };
};

export const cancelImport = () => {
  return (dispatch, getState) => {
    const { source, dest } = getState();

    if (!source || !dest) {
      debug('no active import to cancel.');
      return;
    }
    source.unpipe();
    dest.end();
    dispatch({type: IMPORT_CANCELLED});
  };
};


export const selectImportFileName = (fileName) => {
  return (dispatch) => {
    fs.exists(fileName, function(exists) {
      if (!exists) {
        return dispatch(importFailed(new Error(`File ${fileName} not found`)));
      }
      fs.stat(fileName, function(err, stats) {
        if (err) {
          return dispatch(importFailed(err));
        }

        // TODO: Use peek-stream to detect import file type.
        dispatch({
          type: IMPORT_FILE_SELECTED,
          fileName: fileName,
          fileStats: stats
        });
      });
    });
  };
};

export default reducer;
