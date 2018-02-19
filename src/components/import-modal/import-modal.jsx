import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Modal, Button, FormGroup, InputGroup, FormControl, ControlLabel
} from 'react-bootstrap';
import { TextButton } from 'hadron-react-buttons';

import fileOpenDialog from 'utils/file-open-dialog';
import FILE_TYPES from 'constants/file-types';
import ProgressBar from 'components/progress-bar';
import CancelButton from 'components/cancel-button';

import styles from './import-modal.less';

/**
 * The import modal dialog.
 */
class ImportModal extends PureComponent {
  static displayName = 'ImportModalComponent';

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    importAction: PropTypes.func.isRequired,
    importProgress: PropTypes.number
  };

  /**
   * Handle clicking on the cancel button.
   */
  handleCancel = () => {
    if (this.props.isRunning) {
      this.props.importAction(PROCESS_STATUS.CANCELLED);
    }
    this.setState({ isLastProcessCanceled: true });
  }

  /**
   * Handle closing the modal.
   */
  handleClose = () => {

  }

  /**
   * Handle clicking on the import button.
   */
  handleImport = () => {
    const fileName = fileOpenDialog([FILE_TYPES.JSON, FILE_TYPES.CSV]);
    if (fileName) {
      this.props.importAction(PROCESS_STATUS.STARTED, fileName[0]);
      this.setState({ isLastProcessCanceled: false });
    }
  };

  /**
   * Render the modal.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <Modal show={this.props.isOpen} onHide={this.handleClose} >
        <Modal.Header closeButton>
          Import to Collection
        </Modal.Header>
        <Modal.Body>
          <div className={classnames(styles['import-modal-input'])}>
            Select Input File Type
          </div>
          <div
            className={classnames(styles['import-modal-type-selector'])}
            type="radio"
            name="file-type-selector">
            <Button
              className={classnames({[styles.selected]: fileType === FILE_TYPES.JSON})}
              onClick={this.handleFileTypeSelect(FILE_TYPES.JSON)}>JSON</Button>
            <Button
              className={classnames({[styles.selected]: fileType === FILE_TYPES.CSV})}
              onClick={this.handleFileTypeSelect(FILE_TYPES.CSV)}>CSV</Button>
          </div>
          <form>
            <FormGroup controlId="export-file">
              <ControlLabel>Select File</ControlLabel>
              <InputGroup>
                <FormControl
                  type="text"
                  value={fileName}
                  readOnly />
                <InputGroup.Button>
                  <Button onClick={this.handleDialogOpen}>Browse</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </form>
          <ProgressBar
            progress={this.props.importProgress}
            complete={this.props.importProgress === 100}
            canceled={this.props.isLastProcessCanceled} />
          { this.props.isRunning ? <CancelButton onClick={this.handleCancel} /> : null }
        </Modal.Body>
        <Modal.Footer>
          <TextButton
            className="btn btn-default btn-sm"
            text="Cancel"
            clickHandler={this.handleClose} />
          <TextButton
            className="btn btn-primary btn-sm"
            text="Import"
            clickHandler={this.handleImport} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ImportModal;
