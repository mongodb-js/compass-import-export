import fs from 'fs';
import { Observable } from 'rxjs/Observable';
import streamToObservable from 'stream-to-observable';

import exportCollection from 'utils/export';

const EXPORT_STARTED = 'import-export/export/EXPORT_STARTED';
const EXPORT_PROGRESS = 'import-export/export/EXPORT_PROGRESS';
const EXPORT_COMPLETED = 'import-export/export/EXPORT_COMPLETED';
const EXPORT_CANCELED = 'import-export/export/EXPORT_CANCELED';
const EXPORT_FAILED = 'import-export/export/EXPORT_FAILED';

const INITIAL_STATE = {};

const exportStarted = fileName => ({
  type: EXPORT_STARTED,
  fileName
});

const exportProgress = progress => ({
  type: EXPORT_PROGRESS,
  progress
});

const exportCompleted = file => ({
  type: EXPORT_COMPLETED,
  file
});

const exportCanceled = reason => ({
  type: EXPORT_CANCELED,
  reason
});

const exportFailed = error => ({
  type: EXPORT_FAILED,
  error
});

const exportStartedEpic = (action$, store) =>
  action$.ofType(EXPORT_STARTED)
    .flatMap(action => {
      const { fileName } = action;
      const { stats, ns } = store.getState();
      const fws = fs.createWriteStream(fileName);
      const { cursor, docTransform } = exportCollection(store.getState().dataService, ns);

      docTransform.pipe(fws);
      return streamToObservable(docTransform)
        .map(() => exportProgress((fws.bytesWritten * 100) / stats.rawTotalDocumentSize))
        .takeUntil(action$.ofType(EXPORT_CANCELED))
        .catch(exportFailed)
        .concat(Observable.of(exportCompleted(fileName)))
        .finally(() => {
          cursor.close();
          docTransform.end();
          fws.close();
        });
    });

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXPORT_STARTED:
      return {
        ...state,
        progress: 0,
        fileName: action.fileName
      };
    case EXPORT_PROGRESS:
      return {
        ...state,
        progress: Number(action.progress.toFixed(2))
      };
    case EXPORT_COMPLETED:
      return {
        ...state,
        progress: 100,
        file: action.file
      };
    case EXPORT_CANCELED:
      return {
        ...state,
        progress: 0,
        reason: action.reason
      };
    case EXPORT_FAILED:
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
  exportStartedEpic,
  exportStarted,
  exportCanceled
};
