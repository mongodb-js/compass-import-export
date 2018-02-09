import fs from 'fs';
import { Observable } from 'rxjs';
import streamToObservable from 'stream-to-observable';

import importCollection from 'utils/import';
import SplitLines from 'utils/split-lines-transform';

import PROCESS_STATUS from 'constants/process-status';

const IMPORT_ACTION = 'import-export/import/IMPORT_ACTION';
const IMPORT_PROGRESS = 'import-export/import/IMPORT_PROGRESS';
const IMPORT_COMPLETED = 'import-export/import/IMPORT_COMPLETED';
const IMPORT_CANCELED = 'import-export/import/IMPORT_CANCELED';
const IMPORT_FAILED = 'import-export/import/IMPORT_FAILED';

const INITIAL_STATE = {};

let importStatus = PROCESS_STATUS.UNSPECIFIED;

const importAction = (status, fileName) => ({
  type: IMPORT_ACTION,
  status,
  fileName
});

const importProgress = progress => ({
  type: IMPORT_PROGRESS,
  progress
});

const importFinished = () => ({
  type: importStatus !== PROCESS_STATUS.CANCELLED ? IMPORT_COMPLETED : IMPORT_CANCELED
});

const importFailed = error => ({
  type: IMPORT_FAILED,
  error
});

const importStartedEpic = (action$, store) =>
  action$.ofType(IMPORT_ACTION)
    .flatMap(action => {
      importStatus = action.status;
      if (importStatus === PROCESS_STATUS.CANCELLED) {
        return Observable.empty();
      }

      const { client: { database } } = store.getState().dataService;
      const { fileName } = action;
      const { ns } = store.getState();
      if (!fs.existsSync(fileName)) {
        return importFailed('File not found');
      }
      const stats = fs.statSync(fileName);
      const fileSizeInBytes = stats.size;
      const frs = fs.createReadStream(fileName, 'utf8');
      const fileType = fileName.split('.')[fileName.split('.').length - 1];
      const splitLines = new SplitLines(fileType);

      frs.pipe(splitLines);
      return importCollection(database, ns.split('.')[1], streamToObservable(splitLines))
        .takeWhile(() => importStatus !== PROCESS_STATUS.CANCELLED)
        .map(() => importProgress((frs.bytesRead * 100) / fileSizeInBytes))
        .catch(importFailed)
        .concat(Observable.of('')
          .map(() => importFinished()))
        .finally(() => {
          splitLines.end();
          frs.close();
        });
    });

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case IMPORT_ACTION:
      return {
        ...state,
        progress: 0,
        fileName: action.fileName,
        status: action.status
      };
    case IMPORT_PROGRESS:
      return {
        ...state,
        progress: Number(action.progress.toFixed(2))
      };
    case IMPORT_COMPLETED:
      return {
        ...state,
        progress: 100
      };
    case IMPORT_CANCELED:
      return {
        ...state,
        progress: 0,
        reason: action.reason
      };
    case IMPORT_FAILED:
      return {
        ...state,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
export {
  importStartedEpic,
  importAction
};
