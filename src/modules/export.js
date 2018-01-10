import fs from 'fs';
import { Observable } from 'rxjs/Observable';

import exportCollection from 'utils/export';

const EXPORT_STARTED = 'import-export/export/EXPORT_STARTED';
const EXPORT_PROGRESS = 'import-export/export/EXPORT_PROGRESS';
const EXPORT_COMPLETED = 'import-export/export/EXPORT_COMPLETED';
const EXPORT_CANCELED = 'import-export/export/EXPORT_CANCELED';
const EXPORT_FAILED = 'import-export/export/EXPORT_FAILED';

const INITIAL_STATE = {};

const exportStarted = collectionName => ({
  type: EXPORT_STARTED,
  collectionName
});

const exportProgress = progress => ({
  type: EXPORT_PROGRESS,
  progress
});

const exportCompleted = file => ({
  type: EXPORT_COMPLETED,
  progress: 100,
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
      const { client: { database } } = store.getState().dataService;
      const { collectionName } = action;

      return Observable.fromPromise(database.collection(collectionName).stats());
    })
    .flatMap((stats) => {
      const { client: { database } } = store.getState().dataService;
      const collectionName = stats.ns.split('.')[1];
      // TODO: add check for disk space availability, emit failure if not enough empty space
      const fws = fs.createWriteStream('export-file.json');
      return exportCollection(database, collectionName)
        .takeUntil(action$.ofType(EXPORT_CANCELED))
        .catch(exportFailed)
        .map(
          data => {
            fws.write(data);
            return exportProgress((fws.bytesWritten * 100) / stats.size);
          })
        .catch(exportFailed)
        .concat(
          Observable.of(exportCompleted('export-file.json'))
        );
    });

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXPORT_STARTED:
      return {
        ...state,
        collectionName: action.collectionName
      };
    case EXPORT_PROGRESS:
      return {
        ...state,
        progress: action.progress
      };
    case EXPORT_COMPLETED:
      return {
        ...state,
        file: action.file
      };
    case EXPORT_CANCELED:
      return {
        ...state,
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
