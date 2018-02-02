import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { TextButton } from 'hadron-react-buttons';

import { nsChanged } from 'modules/ns';
import { exportAction } from 'modules/export';
import { importAction } from 'modules/import';

import fileOpenDialog from 'utils/file-open-dialog';
import FILE_TYPES from 'constants/file-types';
import PROCESS_STATUS from 'constants/process-status';

import ExportModal from 'components/export-modal';
import ProgressBar from 'components/progress-bar';
import CancelButton from 'components/cancel-button';

import styles from './import-export.less';

const PROCESS = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT'
};

class ImportExport extends Component {
  static displayName = 'ImportExportComponent';

  static propTypes = {
    dataService: PropTypes.object.isRequired,
    exportAction: PropTypes.func.isRequired,
    importAction: PropTypes.func.isRequired,
    exportProgress: PropTypes.number,
    importProgress: PropTypes.number
  };

  state = {
    currentProcess: '',
    progress: 0,
    isLastProcessCanceled: false,
    isModalOpen: false
  };

  componentWillReceiveProps(nextProps) {
    const { exportProgress, importProgress } = nextProps;
    this.setState({ progress: exportProgress || importProgress });

    if ( exportProgress === 100 || importProgress === 100) {
      this.setState({ currentProcess: '' });
    }
  }

  handleExportModalOpen = () => {
    this.setState({ isModalOpen: true });
  };

  handleExport = (fileName, fileType) => {
    this.setState({ currentProcess: PROCESS.EXPORT, isLastProcessCanceled: false, isModalOpen: false });
    this.props.exportAction(PROCESS_STATUS.STARTED, fileName, fileType);
  }

  handleImport = () => {
    const fileName = fileOpenDialog([FILE_TYPES.JSON, FILE_TYPES.CSV]);
    if (fileName) {
      this.props.importAction(PROCESS_STATUS.STARTED, fileName[0]);
      this.setState({ currentProcess: PROCESS.IMPORT, isLastProcessCanceled: false });
    }
  };

  handleCancel = () => {
    switch (this.state.currentProcess) {
      case PROCESS.EXPORT:
        this.props.exportAction(PROCESS_STATUS.CANCELLED);
        break;
      case PROCESS.IMPORT:
        this.props.importAction(PROCESS_STATUS.CANCELLED);
        break;
      default:
        this.setState({ currentProcess: '' });
    }
    this.setState({ currentProcess: '', isLastProcessCanceled: true });
  }

  handleModalClose = () => {
    this.setState({ isModalOpen: false });
  }

  /**
   * Render ImportExport component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['import-export'])}>
        <p>Compass Import/Export Plugin</p>
        <TextButton
          className="btn btn-default btn-sm"
          clickHandler={ this.handleImport }
          text="Import"
        />
        <TextButton
          className="btn btn-default btn-sm"
          clickHandler={ this.handleExportModalOpen }
          text="Export"
        />
        <div>
          <ProgressBar
            progress={ this.state.progress }
            complete={ this.state.progress === 100 }
            canceled={ this.state.isLastProcessCanceled }
          />
          { this.state.currentProcess ? <CancelButton onClick={ this.handleCancel } /> : null }

        </div>
        <ExportModal
          open={ this.state.isModalOpen }
          handleClose={ this.handleModalClose }
          exportCollection={ this.handleExport }
          query={{
            filter: {
              name: 'Joe',
              age: 25,
              loc: 'New York'
            }
          }}
          count={225}
        />
      </div>
    );
  }
}

/**
 * Map the state of the store to component properties.
 *exportAction
 * @param {Object} state - The state.
 *
 * @returns {Object} The mapped properties.
 */
const mapStateToProps = (state) => ({
  ns: state.ns,
  dataService: state.dataService,
  exportProgress: state.exportData.progress,
  importProgress: state.importData.progress
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  { nsChanged, exportAction, importAction }
)(ImportExport);
