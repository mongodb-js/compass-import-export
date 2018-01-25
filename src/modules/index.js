import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';

import ns from './ns';
import dataService from './data-service';
import exportData, { exportStartedEpic } from './export';
import importData, { importStartedEpic } from './import';

export const rootReducer = combineReducers({
  ns, dataService, exportData, importData
});

export const rootEpic = combineEpics(
  exportStartedEpic, importStartedEpic
);
