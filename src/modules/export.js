/* eslint-disable valid-jsdoc */
import fs from 'fs';
import stream from 'stream';

import PROCESS_STATUS from 'constants/process-status';
import FILE_TYPES from 'constants/file-types';
import { appRegistryEmit } from 'modules/shared';

import { createReadableCollectionStream } from 'utils/collection-stream';

const createProgressStream = require('progress-stream');

import { createLogger } from 'utils/logger';
import { createCSVFormatter, createJSONFormatter, createEJSONSerializer } from 'utils/formatters';

const debug = createLogger('export');

const PREFIX = 'import-export/export';

const STARTED = `${PREFIX}/STARTED`;
const CANCELLED = `${PREFIX}/CANCELLED`;

const PROGRESS = `${PREFIX}/PROGRESS`;
const FINISHED = `${PREFIX}/FINISHED`;
const ERROR = `${PREFIX}/ERROR`;

const SELECT_FILE_TYPE = `${PREFIX}/SELECT_FILE_TYPE`;
const SELECT_FILE_NAME = `${PREFIX}/SELECT_FILE_NAME`;

const OPEN = `${PREFIX}/OPEN`;
const CLOSE = `${PREFIX}/CLOSE`;

const QUERY_CHANGED = `${PREFIX}/QUERY_CHANGED`;
const TOGGLE_FULL_COLLECTION = `${PREFIX}/TOGGLE_FULL_COLLECTION`;

/**
 * A full collection query.
 */
const FULL_QUERY = {
  filter: {}
};

/**
 * The initial state.
 */
const INITIAL_STATE = {
  isOpen: false,
  isFullCollection: false,
  progress: 0,
  query: FULL_QUERY,
  error: null,
  fileName: '',
  fileType: FILE_TYPES.JSON,
  status: PROCESS_STATUS.UNSPECIFIED
};

const onStarted = (source, dest) => ({
  type: STARTED,
  source: source,
  dest: dest
});

const onProgress = (progress) => ({
  type: PROGRESS,
  progress: progress
});

const onFinished = () => ({
  type: FINISHED
});

const onError = (error) => ({
  type: ERROR,
  error: error
});

// TODO: Refactor this so import and export reuse as much
// base logic as possible.
const reducer = (state = INITIAL_STATE, action) => {
  if (action.type === TOGGLE_FULL_COLLECTION) {
    return {
      ...state,
      isFullCollection: !state.isFullCollection
    };
  }

  if (action.type === QUERY_CHANGED) {
    return {
      ...state,
      query: action.query
    };
  }

  if (action.type === OPEN) {
    return {
      ...INITIAL_STATE,
      query: state.query,
      isOpen: true
    };
  }

  if (action.type === CLOSE) {
    return {
      ...state,
      isOpen: false
    };
  }

  if (action.type === STARTED) {
    return {
      ...state,
      error: null,
      progress: 0,
      status: PROCESS_STATUS.STARTED,
      source: action.source,
      dest: action.dest
    };
  }

  if (action.type === PROGRESS) {
    return {
      ...state,
      progress: action.progress
    };
  }

  if (action.type === FINISHED) {
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

  if (action.type === CANCELLED) {
    return {
      ...state,
      progress: 100,
      // isOpen: !isComplete,
      status: PROCESS_STATUS.CANCELED,
      source: undefined,
      dest: undefined
    };
  }

  if (action.type === SELECT_FILE_NAME) {
    return {
      ...state,
      fileName: action.fileName
    };
  }

  if (action.type === SELECT_FILE_TYPE) {
    return {
      ...state,
      fileType: action.fileType
    };
  }

  if (action.type === ERROR) {
    return {
      ...state,
      error: action.error,
      progress: 100,
      status: PROCESS_STATUS.FAILED
    };
  }

  return state;
};


/**
 * Toggle the full collection flag.
 * @api public
 */
export const toggleFullCollection = () => ({
  type: TOGGLE_FULL_COLLECTION
});

/**
 * Select the file type of the export.
 * @api public
 * @param {String} fileType
 */
export const selectExportFileType = (fileType) => ({
  type: SELECT_FILE_TYPE,
  fileType: fileType
});

/**
 * Select the file name to export to
 * @api public
 * @param {String} fileName
 */
export const selectExportFileName = (fileName) => ({
  type: SELECT_FILE_NAME,
  fileName: fileName
});

/**
 * Change the query.
 * @api public
 * @param {Object} query
 */
export const queryChanged = (query) => ({
  type: QUERY_CHANGED,
  query: query
});

/**
 * Open the export modal.
 * @api public
 */
export const openExport = () => ({
  type: OPEN
});

/**
 * Close the export modal.
 * @api public
 */
export const closeExport = () => ({
  type: CLOSE
});

/**
 * Run the actual export to file.
 * @api public
 */
export const startExport = () => {
  return (dispatch, getState) => {
    const { stats, ns, exportData, dataService: { dataService } } = getState();
    const query = exportData.isFullCollection ? {filter: {}} : exportData.query;
    const source = createReadableCollectionStream(dataService, ns, query);

    // TODO: Lucas: stats.rawTotalDocumentSize should instead be a doc counter.
    const progress = createProgressStream({
      length: stats.rawTotalDocumentSize,
      time: 250 /* ms */
    });

    progress.on('progress', function(info) {
      debug('progress', info);
      dispatch(onProgress(info.percentage));
    });

    const serializer = createEJSONSerializer();

    let formatter;
    if (exportData.fileType === 'csv') {
      formatter = createCSVFormatter();
    } else {
      formatter = createJSONFormatter();
    }

    const dest = fs.createWriteStream(exportData.fileName);

    debug('executing pipeline');

    dispatch(onStarted(source, dest));
    stream.pipeline(source, serializer, formatter, progress, dest, function(err, res) {
      if (err) {
        return dispatch(onError(err));
      }
      debug('done', err, res);
      dispatch(onFinished());
      dispatch(appRegistryEmit('export-finished', stats.rawTotalDocumentSize, exportData.fileType));
    });
  };
};

/**
 * Cancel the currently running export operation, if any.
 * @api public
 */
export const cancelExport = () => {
  return (dispatch, getState) => {
    const { exportData } = getState();
    const { source, dest } = exportData;

    if (!source || !dest) {
      debug('no active streams to cancel.');
      return;
    }
    debug('cancelling');
    source.unpipe();
    dest.end();
    debug('cancelled by user');
    dispatch({type: CANCELLED});
  };
};

export default reducer;
