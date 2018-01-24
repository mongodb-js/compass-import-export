import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { TextButton } from 'hadron-react-buttons';

import { nsChanged } from 'modules/ns';
import { exportStarted, exportCanceled } from 'modules/export';
import { importStarted, importCanceled } from 'modules/import';

import ExportModal from './export-modal';
import ProgressBar from './progress-bar';
import CancelButton from './cancel-button';

import styles from './import-export.less';

const PROCESS = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT'
};

class ImportExport extends Component {
  static displayName = 'ImportExportComponent';

  static propTypes = {
    dataService: PropTypes.object.isRequired,
    exportStarted: PropTypes.func.isRequired,
    importStarted: PropTypes.func.isRequired,
    exportCanceled: PropTypes.func.isRequired,
    importCanceled: PropTypes.func.isRequired,
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

  handleExport = () => {
    // this.props.exportStarted('users');
    this.setState({ currentProcess: PROCESS.EXPORT, isLastProcessCanceled: false, isModalOpen: true });
  };

  handleImport = () => {
    this.props.importStarted('users5');
    this.setState({ currentProcess: PROCESS.IMPORT, isLastProcessCanceled: false });
  };

  handleCancel = () => {
    switch (this.state.currentProcess) {
      case PROCESS.EXPORT:
        this.props.exportCanceled();
        break;
      case PROCESS.IMPORT:
        this.props.importCanceled();
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
          clickHandler={ this.handleExport }
          text="Export"
        />
        <div>
          <ProgressBar
            progress={ this.state.progress }
            complete={ this.state.progress === 100 }
            canceled={ this.state.isLastProcessCanceled }
          />
          <CancelButton onClick={ this.handleCancel } />
        </div>
        <ExportModal
          open={ this.state.isModalOpen }
          handleClose={ this.handleModalClose }
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
 *
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
  { nsChanged, exportStarted, importStarted, exportCanceled, importCanceled }
)(ImportExport);
