import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Modal,
  Button,
  FormGroup,
  InputGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';
import { TextButton, IconTextButton } from 'hadron-react-buttons';
import fileOpenDialog from 'utils/file-open-dialog';
import PROCESS_STATUS, { FINISHED_STATUSES } from 'constants/process-status';
import FILE_TYPES from 'constants/file-types';
import ProgressBar from 'components/progress-bar';
import {
  startImport,
  cancelImport,
  selectImportFileType,
  selectImportFileName,
  setDelimiter,
  closeImport
} from 'modules/import';

import ANSIConverter from 'ansi-to-html';

// TODO: lucas: Sync hex values against .less
const ANSI_TO_HTML_OPTIONS = {
  fg: '#FFF',
  bg: '#000',
  newline: true,
  escapeXML: true,
  stream: false
};

const getPrettyErrorMessage = function(err) {
  return new ANSIConverter(ANSI_TO_HTML_OPTIONS).toHtml(err.message);
};

import styles from './import-modal.less';

class ImportModal extends PureComponent {
  static propTypes = {
    open: PropTypes.bool,
    ns: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    error: PropTypes.object,
    startImport: PropTypes.func.isRequired,
    cancelImport: PropTypes.func.isRequired,
    closeImport: PropTypes.func.isRequired,
    selectImportFileType: PropTypes.func.isRequired,
    selectImportFileName: PropTypes.func.isRequired,
    setDelimiter: PropTypes.func.isRequired,
    delimiter: PropTypes.string,
    fileType: PropTypes.string,
    fileName: PropTypes.string,
    docsWritten: PropTypes.number
  };

  getStatusMessage = () => {
    if (this.props.error) {
      return 'Error';
    }
    if (this.props.status === PROCESS_STATUS.STARTED) {
      return 'Importing...';
    }
    if (this.props.status === PROCESS_STATUS.CANCELED) {
      return 'Canceled';
    }
    if (this.props.status === PROCESS_STATUS.COMPLETED) {
      return 'Completed!';
    }

    return 'UNKNOWN';
  };

  /**
   * Handle choosing a file from the file dialog.
   */
  handleChooseFile = () => {
    const file = fileOpenDialog();
    if (file) {
      this.props.selectImportFileName(file[0]);
    }
  };

  /**
   * Handle clicking the cancel button.
   */
  handleCancel = () => {
    this.props.cancelImport();
  };

  /**
   * Handle clicking the close button.
   */
  handleClose = () => {
    this.handleCancel();
    this.props.closeImport();
  };

  /**
   * Handle clicking the import button.
   */
  handleImportBtnClicked = () => {
    this.props.startImport();
  };

  handleOnSubmit = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.props.fileName) {
      this.props.startImport();
    }
  };

  setupDelimiterSelect = ref => {
    if (!ref) return null;

    ref.onchange = evt => {
      this.props.setDelimiter(evt.target.value);
    };
  };

  /**
   * Render the progress bar.
   *
   * @returns {React.Component} The component.
   */
  renderProgressBar = () => {
    if (this.props.status !== PROCESS_STATUS.UNSPECIFIED) {
      return (
        <div>
          <ProgressBar
            progress={this.props.progress}
            status={this.props.status}
            message={this.getStatusMessage()}
            cancel={this.props.cancelImport}
          />
          <p>{this.props.docsWritten} documents imported</p>
        </div>
      );
    }
  };

  renderCSVOptions() {
    if (this.props.fileType !== 'csv') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Delimiter</ControlLabel>
        <FormControl
          componentClass="select"
          placeholder="select"
          inputRef={this.setupDelimiterSelect}
          defaultValue={this.props.delimiter}
        >
          <option value=",">comma</option>
          <option value="\t">\tab</option>
          <option value=";">semicolon</option>
          <option value="🏁">🏁</option>
        </FormControl>
      </FormGroup>
    );
  }
  renderExtendedError() {
    if (!this.props.error) {
      return null;
    }

    const prettyError = getPrettyErrorMessage(this.props.error);
    return (
      <div
        className={styles['error-box']}
        dangerouslySetInnerHTML={{ __html: prettyError }}
      />
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
          Import To Collection {this.props.ns}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleOnSubmit}>
            <FormGroup controlId="import-file">
              <ControlLabel>Select File</ControlLabel>
              <InputGroup
                bsClass={classnames(styles['import-modal-browse-group'])}
              >
                <FormControl type="text" value={this.props.fileName} readOnly />
                <IconTextButton
                  text="Browse"
                  clickHandler={this.handleChooseFile}
                  className={classnames(styles['import-modal-browse-button'])}
                  iconClassName="fa fa-folder-open-o"
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Select Input File Type</ControlLabel>
              <div className={classnames(styles['import-modal-type-selector'])}>
                <Button
                  className={classnames({
                    [styles.selected]: this.props.fileType === FILE_TYPES.JSON
                  })}
                  onClick={this.props.selectImportFileType.bind(
                    this,
                    FILE_TYPES.JSON
                  )}
                >
                  JSON
                </Button>
                <Button
                  className={classnames({
                    [styles.selected]: this.props.fileType === FILE_TYPES.CSV
                  })}
                  onClick={this.props.selectImportFileType.bind(
                    this,
                    FILE_TYPES.CSV
                  )}
                >
                  CSV
                </Button>
              </div>
            </FormGroup>
            {this.renderCSVOptions()}
          </form>
          {this.renderProgressBar()}
          {this.renderExtendedError()}
        </Modal.Body>
        <Modal.Footer>
          <TextButton
            className="btn btn-default btn-sm"
            text={
              FINISHED_STATUSES.includes(this.props.status) ? 'Close' : 'Cancel'
            }
            clickHandler={this.handleClose}
          />
          <TextButton
            className="btn btn-primary btn-sm"
            text={
              this.props.status === PROCESS_STATUS.STARTED
                ? 'Importing...'
                : 'Import'
            }
            disabled={
              !this.props.fileName ||
              this.props.status === PROCESS_STATUS.STARTED
            }
            clickHandler={this.handleImportBtnClicked}
          />
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
  progress: state.importData.progress,
  open: state.importData.isOpen,
  error: state.importData.error,
  fileType: state.importData.fileType,
  fileName: state.importData.fileName,
  status: state.importData.status,
  docsWritten: state.importData.docsWritten,
  delimiter: state.importData.delimiter
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  {
    startImport,
    cancelImport,
    selectImportFileType,
    selectImportFileName,
    setDelimiter,
    closeImport
  }
)(ImportModal);
