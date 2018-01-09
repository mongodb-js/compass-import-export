/**
 * Action for the ns changing.
 */
const DATA_SERVICE_CONNECTED = 'import-export/ns/DATA_SERVICE_CONNECTED';

/**
 * The initial ns state.
 */
const INITIAL_STATE = {};

/**
 * Create a ns changed action.
 *
 * @param {String} ns - The namespace.
 *
 * @returns {Object} The action.
 */
const dataServiceConnected = (error, dataService) => {
  return {
    type: DATA_SERVICE_CONNECTED,
    error,
    dataService
  };
};

const dataServiceEpic = $action =>
  $action.ofType(DATA_SERVICE_CONNECTED)
  .map(
    action => {
      console.log(action);
      return { type: '' };
    }
  );


/**
 * Handle ns changes on the state.
 *
 * @param {String} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {String} The state.
 */
const reducer = (state = INITIAL_STATE, action) => {
  if (action.type === DATA_SERVICE_CONNECTED) {
    return Object.assign(action.dataService, state);
  }
  return state;
};

export default reducer;
export {
  dataServiceConnected,
  dataServiceEpic,
  DATA_SERVICE_CONNECTED
};
