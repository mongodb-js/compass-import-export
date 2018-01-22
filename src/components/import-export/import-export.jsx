import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { nsChanged } from 'modules/ns';
import { exportStarted, exportCanceled } from 'modules/export';
import { importStarted, importCanceled } from 'modules/import';

import ImportButton from './import-button';
import ExportButton from './export-button';
import ProgressBar from './progress-bar';
import CancelButton from './cancel-button';
import ExportModal from './export-modal';

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
    isLastProcessCanceled: false
  };

  componentWillReceiveProps(nextProps) {
    const { exportProgress, importProgress } = nextProps;
    this.setState({ progress: exportProgress || importProgress });

    if ( exportProgress === 100 || importProgress === 100) {
      this.setState({ currentProcess: '' });
    }
  }

  handleExport = () => {
    this.props.exportStarted('users');
    this.setState({ currentProcess: PROCESS.EXPORT, isLastProcessCanceled: false });
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

  /**
   * Render ImportExport component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['import-export'])}>
        <p>Compass Import/Export Plugin</p>
        <ImportButton onClick={ this.handleImport } />
        <ExportButton onClick={ this.handleExport } />
        <ExportModal
          count={445}
          query={{}}
          cancelExport={this.props.exportCancelled}
          exportCollection={this.props.exportStarted}
          isOpen />
        <div>
          <ProgressBar
            progress={ this.state.progress }
            complete={ this.state.progress === 100 }
            canceled={ this.state.isLastProcessCanceled }
          />
          <CancelButton onClick={ this.handleCancel } />
        </div>
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
