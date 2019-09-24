import { combineReducers } from 'redux';

import ns from './ns';
import dataService from './data-service';
import stats from './stats';
import appRegistry from './app-registry';
import globalAppRegistry from './global-app-registry';
import exportData from './export';
import importData from './import';

/**
 * The root reducer for the store.
 *
 * @returns {Function} The reducer.
 */
const rootReducer = combineReducers({
  appRegistry,
  globalAppRegistry,
  dataService,
  ns,
  stats,
  exportData,
  importData
});

export default rootReducer;
