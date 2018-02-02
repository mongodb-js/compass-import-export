import fs from 'fs';
import { Observable } from 'rxjs/Observable';
import streamToObservable from 'stream-to-observable';

import exportCollection from 'utils/export';

import PROCESS_STATUS from 'constants/process-status';

const EXPORT_ACTION = 'import-export/export/EXPORT_ACTION';
const EXPORT_PROGRESS = 'import-export/export/EXPORT_PROGRESS';
const EXPORT_COMPLETED = 'import-export/export/EXPORT_COMPLETED';
const EXPORT_CANCELED = 'import-export/export/EXPORT_CANCELED';
const EXPORT_FAILED = 'import-export/export/EXPORT_FAILED';

const INITIAL_STATE = {};

let exportStatus = PROCESS_STATUS.UNSPECIFIED;

const exportAction = (status, fileName, fileType) => ({
  type: EXPORT_ACTION,
  status,
  fileName,
  fileType
});

const exportProgress = progress => ({
  type: EXPORT_PROGRESS,
  progress
});

const exportFinished = () => ({
  type: exportStatus !== PROCESS_STATUS.CANCELLED ? EXPORT_COMPLETED : EXPORT_CANCELED
});

const exportFailed = error => ({
  type: EXPORT_FAILED,
  error
});

const exportStartedEpic = (action$, store) =>
  action$.ofType(EXPORT_ACTION)
    .flatMap(action => {
      exportStatus = action.status;
      if (exportStatus === PROCESS_STATUS.CANCELLED) {
        return Observable.empty();
      }

      const { fileName, fileType } = action;
      const { stats, ns } = store.getState();
      const fws = fs.createWriteStream(fileName);
      const { cursor, docTransform } = exportCollection(store.getState().dataService, ns, fileType);

      docTransform.pipe(fws);
      return streamToObservable(docTransform)
        .map(() => exportProgress((fws.bytesWritten * 100) / stats.rawTotalDocumentSize))
        .takeWhile(() => exportStatus !== PROCESS_STATUS.CANCELLED)
        .catch(exportFailed)
        .concat(Observable.of('')
          .map(() => exportFinished()))
        .finally(() => {
          cursor.close();
          docTransform.end();
          fws.close();
        });
    });

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXPORT_ACTION:
      return {
        ...state,
        progress: 0,
        fileName: action.fileName,
        fileType: action.fileType,
        status: action.status
      };
    case EXPORT_PROGRESS:
      return {
        ...state,
        progress: Number(action.progress.toFixed(2))
      };
    case EXPORT_COMPLETED:
      return {
        ...state,
        progress: 100
      };
    case EXPORT_CANCELED:
      return {
        ...state,
        progress: 0
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
  exportAction
};
