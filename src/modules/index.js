import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';

import ns from './ns';
import dataService, { dataServiceEpic } from './data-service';

export const rootReducer = combineReducers({
  ns, dataService
});

export const rootEpic = combineEpics(
  dataServiceEpic
);
