import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Modal,
  FormGroup,
} from 'react-bootstrap';
import { TextButton } from 'hadron-react-buttons';
import ExportSelectOutput from 'components/export-select-output';
import ExportSelectFields from 'components/export-select-fields';
import QueryViewer from 'components/query-viewer';

import revealFile from 'utils/reveal-file';
import formatNumber from 'utils/format-number';

import {
  STARTED,
  CANCELED,
  COMPLETED,
  UNSPECIFIED
} from 'constants/process-status';

import {
  QUERY,
  FIELDS,
  FILETYPE
} from 'constants/modal-progress-status';

import {
  startExport,
  sampleFields,
  cancelExport,
  toggleFullCollection,
  updateFields,
  changeModalProgressStatus,
  selectExportFileType,
  selectExportFileName,
  closeExport
} from 'modules/export';

import styles from './export-modal.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-modal');

/**
 * TODO: lucas: When import complete, maybe:
 * 1. hide “cancel” and replace “import” with “done”?
 * 2. "canel" button -> "close" and import becomes "import another"
 * or "view documents"?
 */

/**
 * Progress messages.
 */
const MESSAGES = {
  [STARTED]: 'Exporting documents...',
  [CANCELED]: 'Export canceled',
  [COMPLETED]: 'Export completed',
  [UNSPECIFIED]: ''
};

/**
 * The export collection modal.
 */
class ExportModal extends PureComponent {
  static propTypes = {
    open: PropTypes.bool,
    ns: PropTypes.string.isRequired,
    count: PropTypes.number,
    query: PropTypes.object.isRequired,
    progress: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    error: PropTypes.object,
    sampleFields: PropTypes.func.isRequired,
    updateFields: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    startExport: PropTypes.func.isRequired,
    cancelExport: PropTypes.func.isRequired,
    closeExport: PropTypes.func.isRequired,
    isFullCollection: PropTypes.bool.isRequired,
    toggleFullCollection: PropTypes.func.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired,
    changeModalProgressStatus: PropTypes.func.isRequired,
    exportProgressStatus: PropTypes.string.isRequired,
    fileType: PropTypes.string,
    fileName: PropTypes.string,
    exportedDocsCount: PropTypes.number
  };

  /**
   * Get the status message.
   *
   * @returns {String} The status message.
   */
  getStatusMessage = () => {
    return (
      MESSAGES[this.props.status] ||
      (this.props.error ? this.props.error.message : '')
    );
  };

  /**
   * Handle clicking the cancel button.
   */
  handleCancel = () => {
    this.props.cancelExport();
  };

  /**
   * Handle clicking the close button.
   */
  handleClose = () => {
    this.handleCancel();
    this.props.closeExport();
  };

  /**
   * Handle clicking the export button.
   */
  handleExport = () => {
    this.props.startExport();
  };

  /**
   * Start the next step of exporting: selecting fields
   */
  handleChangeModalStatus = (status) => {
    this.props.changeModalProgressStatus(status);
    if (status === FIELDS) {
      this.props.sampleFields();
    }
  }

  handleRevealClick = () => {
    revealFile(this.props.fileName);
  };

  /**
   * Handle switching between filtered and full export.
   */
  handleExportOptionSelect = () => {
    this.props.toggleFullCollection();
  }

  /**
   * Return back in export flow.
   */
  handleBackButton = () => {
    const previousState = this.props.exportProgressStatus === FILETYPE ? FIELDS : QUERY;
    this.handleChangeModalStatus(previousState);
  }

  /**
   * Stop form default submission to a whitescreen
   * and start the export if ready.
   * @param {Object} evt - DOM event
   */
  handleOnSubmit = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.props.fileName) {
      this.props.startExport();
    }
  };

  renderExportOptions() {
    const { isFullCollection } = this.props;

    const queryClassName = classnames({
      [style('query')]: true,
      [style('query-is-disabled')]: isFullCollection
    });

    const queryViewerClassName = classnames({
      [style('query-viewer')]: true,
      [style('query-viewer-is-disabled')]: isFullCollection
    });

    if (this.props.exportProgressStatus === QUERY) {
      return (
        <FormGroup controlId="export-collection-option">
          <div className={style('radio')}>
            <label className={queryClassName}>
              <input type="radio"
                aria-label="Export collection with filters radio button"
                value="filter"
                onChange={this.handleExportOptionSelect}
                checked={!isFullCollection}/>
              Export query with filters &mdash; {formatNumber(this.props.count)} results (Recommended)
            </label>
          </div>
          <div className={queryViewerClassName}>
            <QueryViewer
              query={this.props.query}
              disabled={isFullCollection}
              ns={this.props.ns}
            />
          </div>
          <div className={style('radio')}>
            <label>
              <input type="radio"
                aria-label="Export full collection radio button"
                value="full"
                onChange={this.handleExportOptionSelect}
                checked={isFullCollection}/>
              Export Full Collection
            </label>
          </div>
        </FormGroup>
      );
    }
  }

  renderSelectFields() {
    if (this.props.exportProgressStatus === FIELDS ) {
      return (
        <ExportSelectFields
          fields={this.props.fields}
          updateFields={this.props.updateFields}/>
      );
    }
  }

  renderSelectOutput() {
    if (this.props.exportProgressStatus === FILETYPE) {
      return (
        <ExportSelectOutput
          count={this.props.count}
          progress={this.props.progress}
          status={this.props.status}
          error={this.props.error}
          startExport={this.props.startExport}
          selectExportFileType={this.props.selectExportFileType}
          selectExportFileName={this.props.selectExportFileName}
          fileType={this.props.fileType}
          fileName={this.props.fileName}
          cancelExport={this.props.cancelExport}
          exportedDocsCount={this.props.exportedDocsCount}/>
      );
    }
  }

  renderBackButton() {
    const backButtonClassname = classnames('btn', 'btn-default', 'btn-sm', style('back-button'));
    if (this.props.exportProgressStatus !== QUERY) {
      return (
        <TextButton
          text="< BACK"
          clickHandler={this.handleBackButton}
          className={backButtonClassname}/>
      );
    }
  }

  renderNextButton() {
    if (this.props.status === COMPLETED) {
      return (
        <TextButton
          className="btn btn-primary btn-sm"
          text="Show File"
          clickHandler={this.handleRevealClick}
        />
      );
    }
    if (this.props.exportProgressStatus === QUERY) {
      return (
        <TextButton
          className="btn btn-primary btn-sm"
          text="Select Fields"
          clickHandler={this.handleChangeModalStatus.bind(this, FIELDS)}/>
      );
    }
    if (this.props.exportProgressStatus === FIELDS) {
      return (
        <TextButton
          className="btn btn-primary btn-sm"
          text="Select Output"
          clickHandler={this.handleChangeModalStatus.bind(this, FILETYPE)}/>
      );
    }
    return (
      <TextButton
        className="btn btn-primary btn-sm"
        text="Export"
        disabled={this.props.status === STARTED}
        clickHandler={this.handleExport}/>
    );
  }

  /**
   * Render the component.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <Modal show={this.props.open} onHide={this.handleClose} backdrop="static">
        <Modal.Header closeButton>
          Export Collection {this.props.ns}
        </Modal.Header>
        <Modal.Body>
          {this.renderExportOptions()}
          {this.renderSelectFields()}
          {this.renderSelectOutput()}
        </Modal.Body>
        <Modal.Footer>
          {this.renderBackButton()}
          <TextButton
            className="btn btn-default btn-sm"
            text={this.props.status === COMPLETED ? 'Close' : 'Cancel'}
            clickHandler={this.handleClose}
          />
          {this.renderNextButton()}
        </Modal.Footer>
      </Modal>
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
const mapStateToProps = state => ({
  ns: state.ns,
  progress: state.exportData.progress,
  count: state.exportData.count || state.stats.rawDocumentCount,
  query: state.exportData.query,
  isFullCollection: state.exportData.isFullCollection,
  open: state.exportData.isOpen,
  error: state.exportData.error,
  fields: state.exportData.fields,
  fileType: state.exportData.fileType,
  fileName: state.exportData.fileName,
  status: state.exportData.status,
  exportedDocsCount: state.exportData.exportedDocsCount,
  exportProgressStatus: state.exportData.exportProgressStatus
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  {
    startExport,
    sampleFields,
    cancelExport,
    toggleFullCollection,
    updateFields,
    changeModalProgressStatus,
    selectExportFileType,
    selectExportFileName,
    closeExport
  }
)(ExportModal);
