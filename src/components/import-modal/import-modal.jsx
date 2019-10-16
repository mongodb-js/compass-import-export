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
import {
  FINISHED_STATUSES,
  STARTED,
  COMPLETED,
  CANCELED
} from 'constants/process-status';
import FILE_TYPES from 'constants/file-types';
import ProgressBar from 'components/progress-bar';
import ErrorBox from 'components/error-box';

import {
  startImport,
  cancelImport,
  selectImportFileType,
  selectImportFileName,
  setDelimiter,
  setStopOnErrors,
  setIgnoreEmptyFields,
  closeImport
} from 'modules/import';

import styles from './import-modal.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'import-modal');

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
    docsWritten: PropTypes.number,
    stopOnErrors: PropTypes.bool,
    setStopOnErrors: PropTypes.func,
    ignoreEmptyFields: PropTypes.bool,
    setIgnoreEmptyFields: PropTypes.func
  };

  getStatusMessage() {
    const status = this.props.status;
    if (this.props.error) {
      return 'Error importing';
    }
    if (status === STARTED) {
      return 'Importing documents...';
    }
    if (status === CANCELED) {
      return 'Import canceled';
    }
    if (status === COMPLETED) {
      return 'Import completed';
    }

    return 'UNKNOWN';
  }

  /**
   * Handle choosing a file from the file dialog.
   */
  // eslint-disable-next-line react/sort-comp
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

  renderOptions() {
    if (this.props.fileType !== 'csv') {
      return null;
    }

    return (
      <fieldset>
        <legend>Options</legend>
        <div>
          <select
            onChange={() => {
              this.props.setDelimiter(!this.props.delimiter);
            }}
            defaultValue={this.props.delimiter}
          >
            <option value=",">comma</option>
            <option value="\t">\tab</option>
            <option value=";">semicolon</option>
            <option value=" ">space</option>
          </select>
          <label>Delimiter</label>
        </div>
        <div>
          <input
            type="checkbox"
            defaultValue={this.props.ignoreEmptyFields}
            onChange={() => {
              this.props.setIgnoreEmptyFields(!this.props.ignoreEmptyFields);
            }}
          />
          <label>Ignore empty values</label>
        </div>
        <div>
          <input
            type="checkbox"
            defaultValue={this.props.stopOnErrors}
            onChange={() => {
              this.props.setStopOnErrors(!this.props.stopOnErrors);
            }}
          />
          <label>Stop on errors</label>
        </div>
      </fieldset>
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
              <InputGroup bsClass={style('browse-group')}>
                <FormControl type="text" value={this.props.fileName} readOnly />
                <IconTextButton
                  text="Browse"
                  clickHandler={this.handleChooseFile}
                  className={style('browse-button')}
                  iconClassName="fa fa-folder-open-o"
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Select Input File Type</ControlLabel>
              <div className={style('type-selector')}>
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
            {this.renderOptions()}
          </form>
          <ProgressBar
            progress={this.props.progress}
            status={this.props.status}
            message={this.getStatusMessage()}
            cancel={this.props.cancelImport}
            docsWritten={this.props.docsWritten}
          />
          <ErrorBox error={this.props.error} />
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
            text={this.props.status === STARTED ? 'Importing...' : 'Import'}
            disabled={!this.props.fileName || this.props.status === STARTED}
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
  docsTotal: state.importData.docsTotal,
  delimiter: state.importData.delimiter,
  stopOnErrors: state.importData.stopOnErrors,
  ignoreEmptyFields: state.importData.ignoreEmptyFields
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
    setStopOnErrors,
    setIgnoreEmptyFields,
    closeImport
  }
)(ImportModal);
