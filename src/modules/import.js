import fs from 'fs';
import { Observable } from 'rxjs';
import streamToObservable from 'stream-to-observable';

import importCollection from 'utils/import';
import SplitLines from 'utils/split-lines-transform';

const IMPORT_STARTED = 'import-export/import/IMPORT_STARTED';
const IMPORT_PROGRESS = 'import-export/import/IMPORT_PROGRESS';
const IMPORT_COMPLETED = 'import-export/import/IMPORT_COMPLETED';
const IMPORT_CANCELED = 'import-export/import/IMPORT_CANCELED';
const IMPORT_FAILED = 'import-export/import/IMPORT_FAILED';

const INITIAL_STATE = {};

const importStarted = (collectionName, fileName) => ({
  type: IMPORT_STARTED,
  collectionName,
  fileName
});

const importProgress = progress => ({
  type: IMPORT_PROGRESS,
  progress
});

const importCompleted = () => ({
  type: IMPORT_COMPLETED
});

const importCanceled = reason => ({
  type: IMPORT_CANCELED,
  reason
});

const importFailed = error => ({
  type: IMPORT_FAILED,
  error
});

const importStartedEpic = (action$, store) =>
  action$.ofType(IMPORT_STARTED)
    .flatMap(action => {
      const { client: { database } } = store.getState().dataService;
      const { collectionName, fileName } = action;
      if (!fs.existsSync(fileName)) {
        return importFailed('File not found');
      }
      const stats = fs.statSync(fileName);
      const fileSizeInBytes = stats.size;
      const frs = fs.createReadStream(fileName, 'utf8');
      const splitLines = new SplitLines();

      frs.pipe(splitLines);
      return importCollection(database, collectionName, streamToObservable(splitLines))
        .takeUntil(action$.ofType(IMPORT_CANCELED))
        .map(() => importProgress((frs.bytesRead * 100) / fileSizeInBytes))
        .catch(importFailed);
    })
    .concat(
      Observable.of(importCompleted())
    );

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case IMPORT_STARTED:
      return {
        ...state,
        collectionName: action.collectionName
      };
    case IMPORT_PROGRESS:
      return {
        ...state,
        progress: action.progress
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
  importStarted,
  importCanceled
};
