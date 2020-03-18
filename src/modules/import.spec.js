import reducer, {
  STARTED,
  CANCELED,
  PROGRESS,
  FINISHED,
  FAILED,
  FILE_TYPE_SELECTED,
  selectImportFileType,
  FILE_SELECTED,
  OPEN,
  CLOSE,
  SET_PREVIEW,
  SET_DELIMITER,
  SET_GUESSTIMATED_TOTAL,
  SET_STOP_ON_ERRORS,
  SET_IGNORE_BLANKS,
  TOGGLE_INCLUDE_FIELD,
  SET_FIELD_TYPE,
  INITIAL_STATE
} from './import';
import PROCESS_STATUS from 'constants/process-status';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function setupMockStore() {
  const state = {
    importData: {
      ...INITIAL_STATE
    }
  };
  const store = mockStore(state);
  return { state, store };
}


describe('import [module]', () => {
  describe('selectImportFileType', () => {
    let state;
    let store;

    before(() => {
      const mock = setupMockStore();
      this.state = mock.state;
      this.store = mock.store;
    });

    it('dispatch a FILE_TYPE_SELECTED action', done => {
      console.log('can i do this?', { test: this });
      // See https://github.com/dmitry-zaets/redux-mock-store/issues/71#issuecomment-369546064
      // redux-mock-store does not update state automatically.
      store.subscribe(() => {
        const expected = {
          fileType: 'csv',
          type: FILE_TYPE_SELECTED
        };

        expect(reducer(state, expected).fileType).to.be.deep.equal('csv');
        done();
      });
      store.dispatch(selectImportFileType('csv'));

      expect(store.getActions()).to.deep.equal([
        {
          fileType: 'csv',
          type: FILE_TYPE_SELECTED
        }
      ]);
    });

    afterEach(() => {
      store.resetActions();
    });
  });
  // });
  // describe('#selectImportFileName', () => {
  //   it('returns the action', () => {
  //     expect(actions.selectImportFileName('test.json')).to.deep.equal({
  //       type: actions.SELECT_FILE_NAME,
  //       fileName: 'test.json'
  //     });
  //   });

  // describe('#reducer', () => {
  //   context('when the action type is FINISHED', () => {
  //     context('when the state has an error', () => {
  //       it('returns the new state and stays open', () => {
  //         expect(reducer({ error: true, isOpen: false }, action)).to.deep.equal({
  //           isOpen: true,
  //           progress: 100,
  //           error: true,
  //           status: undefined
  //         });
  //       });
  //     });

  //     context('when the state has no error', () => {
  //       const action = actions.onFinished();

  //       it('returns the new state and closes', () => {
  //         expect(reducer({ isOpen: true }, action)).to.deep.equal({
  //           isOpen: false,
  //           progress: 100,
  //           status: undefined
  //         });
  //       });
  //     });

  //     context('when the status is started', () => {
  //       const action = actions.onFinished();

  //       it('sets the status to completed', () => {
  //         expect(reducer({ status: PROCESS_STATUS.STARTED }, action)).to.deep.equal({
  //           isOpen: false,
  //           progress: 100,
  //           status: PROCESS_STATUS.COMPLETED
  //         });
  //       });
  //     });

  //     context('when the status is canceled', () => {
  //       const action = actions.onFinished();

  //       it('keeps the same status', () => {
  //         expect(reducer({ status: PROCESS_STATUS.CANCELED }, action)).to.deep.equal({
  //           isOpen: true,
  //           progress: 100,
  //           status: PROCESS_STATUS.CANCELED
  //         });
  //       });
  //     });

  //     context('when the status is failed', () => {
  //       const action = actions.onFinished();

  //       it('keeps the same status', () => {
  //         expect(reducer({ status: PROCESS_STATUS.FAILED }, action)).to.deep.equal({
  //           isOpen: true,
  //           progress: 100,
  //           status: PROCESS_STATUS.FAILED
  //         });
  //       });
  //     });
  //   });

  //   context('when the action type is PROGRESS', () => {
  //     const action = actions.onProgress(55);

  //     it('returns the new state', () => {
  //       expect(reducer(undefined, action)).to.deep.equal({
  //         isOpen: false,
  //         progress: 55,
  //         error: null,
  //         fileName: '',
  //         fileType: 'json',
  //         status: 'UNSPECIFIED'
  //       });
  //     });
  //   });

  //   context('when the action type is SELECT_FILE_TYPE', () => {
  //     const action = actions.selectImportFileType('csv');

  //     it('returns the new state', () => {
  //       expect(reducer(undefined, action)).to.deep.equal({
  //         isOpen: false,
  //         progress: 0,
  //         error: null,
  //         fileName: '',
  //         fileType: 'csv',
  //         status: 'UNSPECIFIED'
  //       });
  //     });
  //   });

  //   context('when the action type is SELECT_FILE_NAME', () => {
  //     const action = actions.selectImportFileName('test.json');

  //     it('returns the new state', () => {
  //       expect(reducer(undefined, action)).to.deep.equal({
  //         isOpen: false,
  //         progress: 0,
  //         error: null,
  //         fileName: 'test.json',
  //         fileType: 'json',
  //         status: 'UNSPECIFIED'
  //       });
  //     });
  //   });

  //   context('when the action type is OPEN', () => {
  //     const action = actions.openImport();

  //     it('returns the new state', () => {
  //       expect(reducer(undefined, action)).to.deep.equal({
  //         isOpen: true,
  //         progress: 0,
  //         error: null,
  //         fileName: '',
  //         fileType: 'json',
  //         status: 'UNSPECIFIED'
  //       });
  //     });
  //   });

  //   context('when the action type is CLOSE', () => {
  //     const action = actions.closeImport();

  //     it('returns the new state', () => {
  //       expect(reducer({}, action)).to.deep.equal({ isOpen: false });
  //     });
  //   });

  //   context('when the action type is FAILED', () => {
  //     const error = new Error('failed');
  //     const action = actions.onError(error);

  //     it('returns the new state', () => {
  //       expect(reducer(undefined, action)).to.deep.equal({
  //         isOpen: false,
  //         progress: 100,
  //         error: error,
  //         fileName: '',
  //         fileType: 'json',
  //         status: 'FAILED'
  //       });
  //     });
  //   });

  //   context('when the action type is not defined', () => {
  //     it('returns the initial state', () => {
  //       expect(reducer('', {})).to.equal('');
  //     });
  //   });
  // });

  // describe('#openImport', () => {
  //   it('returns the action', () => {
  //     expect(actions.openImport()).to.deep.equal({
  //       type: actions.OPEN
  //     });
  //   });
  // });

  // describe('#closeImport', () => {
  //   it('returns the action', () => {
  //     expect(actions.closeImport()).to.deep.equal({
  //       type: actions.CLOSE
  //     });
  //   });
  // });

  // describe('#onError', () => {
  //   const error = new Error('failed');

  //   it('returns the action', () => {
  //     expect(actions.onError(error)).to.deep.equal({
  //       type: actions.FAILED,
  //       error: error
  //     });
  //   });
  // });

  // describe('#onFinished', () => {
  //   it('returns the action', () => {
  //     expect(actions.onFinished()).to.deep.equal({
  //       type: actions.FINISHED
  //     });
  //   });
  // });

  // describe('#onProgress', () => {
  //   it('returns the action', () => {
  //     expect(actions.onProgress(34)).to.deep.equal({
  //       type: actions.PROGRESS,
  //       progress: 34,
  //       error: null
  //     });
  //   });
  // });

  // describe('#selectImportFileName', () => {
  //   it('returns the action', () => {
  //     expect(actions.selectImportFileName('test.json')).to.deep.equal({
  //       type: actions.SELECT_FILE_NAME,
  //       fileName: 'test.json'
  //     });
  //   });
  // });
});
