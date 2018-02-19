import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { TextButton } from 'hadron-react-buttons';
import { nsChanged } from 'modules/ns';
import { importAction } from 'modules/import';
import ExportModal from 'components/export-modal';
import {
  exportAction,
  selectExportFileType,
  selectExportFileName,
  closeExport
} from 'modules/export';

import styles from './import-export.less';

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
    exportError: PropTypes.object,
    exportQuery: PropTypes.object.isRequired,
    exportStatus: PropTypes.string.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired
  };

  handleExportModalOpen = () => {
    global.hadronApp.appRegistry.emit('open-export', this.props.ns, { filter: {}});
  };

  // handleImport = () => {
    // const fileName = fileOpenDialog([FILE_TYPES.JSON, FILE_TYPES.CSV]);
    // if (fileName) {
      // this.props.importAction(PROCESS_STATUS.STARTED, fileName[0]);
      // this.setState({ currentProcess: PROCESS.IMPORT, isLastProcessCanceled: false });
    // }
  // };

  // handleCancel = () => {
    // this.props.importAction(PROCESS_STATUS.CANCELLED);
  // }

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
        <ExportModal
          open={this.props.exportOpen}
          closeExport={this.props.closeExport}
          exportAction={this.props.exportAction}
          status={this.props.exportStatus}
          progress={this.props.exportProgress}
          ns={this.props.ns}
          query={this.props.exportQuery}
          error={this.props.exportError}
          count={this.props.exportCount}
          fileType={this.props.exportFileType}
          fileName={this.props.exportFileName}
          selectExportFileType={this.props.selectExportFileType}
          selectExportFileName={this.props.selectExportFileName} />
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
  exportError: state.exportData.error,
  exportFileType: state.exportData.fileType,
  exportFileName: state.exportData.fileName,
  exportStatus: state.exportData.status
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
