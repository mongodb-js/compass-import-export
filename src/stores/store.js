import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import { rootReducer, rootEpic } from 'modules';

import { nsChanged } from 'modules/ns';
import { dataServiceConnected } from 'modules/data-service';

/**
 * The store has a combined reducer.
 */
const store = createStore(
  rootReducer,
  applyMiddleware(
    createEpicMiddleware(rootEpic)
  ));

/**
 * Called when the app registry is activated.
 *
 * @param {AppRegistry} appRegistry - The app registry.
 */
store.onActivated = (appRegistry) => {
  appRegistry.on('collection-changed', nsChanged);
  appRegistry.on('data-service-connected', (err, ds) => store.dispatch(dataServiceConnected(err, ds)));
};

export default store;
