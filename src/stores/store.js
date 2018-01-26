import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import { rootReducer, rootEpic } from 'modules';

import { nsChanged } from 'modules/ns';
import { dataServiceConnected } from 'modules/data-service';

const epicMiddleware = createEpicMiddleware(rootEpic);

/**
 * The store has a combined reducer.
 */
const store = createStore(
  rootReducer,
  applyMiddleware(
    epicMiddleware
  )
);

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../modules', () => {
    const { rootReducer: nextRootReducer, rootEpic: nextRootEpic } = require('../modules');
    store.replaceReducer(nextRootReducer);
    epicMiddleware.replaceEpic(nextRootEpic);
  });
}

/**
 * Called when the app registry is activated.
 *
 * @param {AppRegistry} appRegistry - The app registry.
 */
store.onActivated = (appRegistry) => {
  appRegistry.on('collection-changed', nsChanged);
  appRegistry.on('data-service-connected', (err, ds) => store.dispatch(dataServiceConnected(err, ds)));
  // appRegistry.on('open-export', openExport);
};

export default store;
