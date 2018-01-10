import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';

import ns from './ns';
import dataService, { dataServiceEpic } from './data-service';
import exportData, { exportStartedEpic } from './export';

export const rootReducer = combineReducers({
  ns, dataService, exportData
});

export const rootEpic = combineEpics(
  dataServiceEpic, exportStartedEpic
);
