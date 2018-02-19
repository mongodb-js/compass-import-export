import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { TextButton } from 'hadron-react-buttons';

import { nsChanged } from 'modules/ns';
import {
  exportAction,
  selectExportFileType,
  selectExportFileName,
  closeExport
} from 'modules/export';
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
    ns: PropTypes.string.isRequired,
    dataService: PropTypes.object.isRequired,
    importAction: PropTypes.func.isRequired,
    importProgress: PropTypes.number,
    exportAction: PropTypes.func.isRequired,
    closeExport: PropTypes.func.isRequired,
    exportFileType: PropTypes.string.isRequired,
    exportFileName: PropTypes.string.isRequired,
    exportProgress: PropTypes.number,
    exportCount: PropTypes.number,
    exportOpen: PropTypes.bool.isRequired,
    exportQuery: PropTypes.object.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired
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

  handleExportModalOpen = () => {
    global.hadronApp.appRegistry.emit('open-export', this.props.ns, { filter: {}});
  };

  handleExport = (fileName, fileType) => {
    this.setState({ currentProcess: PROCESS.EXPORT, isLastProcessCanceled: false });
    this.props.closeExport();
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

  /**
   * Render ImportExport component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['import-export'])}>
        <TextButton
          className="btn btn-default btn-sm"
          clickHandler={ this.handleImport }
          text="Import" />
        <TextButton
          className="btn btn-default btn-sm"
          clickHandler={ this.handleExportModalOpen }
          text="Export" />
        <div>
          <ProgressBar
            progress={ this.state.progress }
            complete={ this.state.progress === 100 }
            canceled={ this.state.isLastProcessCanceled } />
          { this.state.currentProcess ? <CancelButton onClick={ this.handleCancel } /> : null }
        </div>
        <ExportModal
          open={this.props.exportOpen}
          handleClose={this.props.closeExport}
          exportCollection={this.handleExport}
          ns={this.props.ns}
          query={this.props.exportQuery}
          count={this.props.exportCount}
          fileType={this.props.exportFileType}
          fileName={this.props.exportFileName}
          selectExportFileType={this.props.selectExportFileType}
          selectExportFileName={this.props.selectExportFileName}
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
  importProgress: state.importData.progress,
  exportProgress: state.exportData.progress,
  exportCount: state.stats.rawDocumentCount,
  exportQuery: state.exportData.query,
  exportOpen: state.exportData.isOpen,
  exportFileType: state.exportData.fileType,
  exportFileName: state.exportData.fileName
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  {
    nsChanged,
    exportAction,
    importAction,
    selectExportFileType,
    selectExportFileName,
    closeExport
  }
)(ImportExport);
