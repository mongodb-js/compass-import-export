import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Modal, Button, FormGroup, InputGroup, FormControl, ControlLabel
} from 'react-bootstrap';
import { TextButton } from 'hadron-react-buttons';

import QueryViewer from 'components/query-viewer';

import fileOpenDialog from 'utils/file-open-dialog';
import FILE_TYPES from 'constants/file-types';

import styles from './export-modal.less';

class ExportModal extends PureComponent {

  static propTypes = {
    open: PropTypes.bool,
    count: PropTypes.number,
    query: PropTypes.object,
    exportCollection: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  state = {
    exportFileType: FILE_TYPES.JSON,
    fileName: ''
  };

  handleFileTypeSelect = type => () => this.setState({ exportFileType: type });

  handleDialogOpen = () => {
    const fileType = FILE_TYPES[this.state.exportFileType];
    const file = fileOpenDialog(fileType);
    if (file) {
      this.setState({ fileName: file[0] });
    }
  }

  handleExportClick = () => {
    const { fileName } = this.state;
    if (fileName) {
      this.props.exportCollection(fileName);
    }
  }

  render() {
    const { open, count, query, handleClose } = this.props;
    const { exportFileType, fileName } = this.state;
    return (
      <Modal show={open} onHide={handleClose} >
        <Modal.Header closeButton>
          Export Collection
        </Modal.Header>
        <Modal.Body>
          <div className={classnames(styles['export-modal-info'])}>
            Exporting {count} documents returned by the following query:
          </div>
          <div className={classnames(styles['export-modal-query'])}>
            <QueryViewer query={query} />
          </div>
          <div className={classnames(styles['export-modal-output'])}>
            Select Output File Type
          </div>
          <div
            className={classnames(styles['export-modal-type-selector'])}
            type="radio"
            name="file-type-selector"
          >
            <Button
              className={classnames({[styles.selected]: exportFileType === FILE_TYPES.JSON})}
              onClick={this.handleFileTypeSelect(FILE_TYPES.JSON)}
            >JSON</Button>
            <Button
              className={classnames({[styles.selected]: exportFileType === FILE_TYPES.CSV})}
              onClick={this.handleFileTypeSelect(FILE_TYPES.CSV)}
            >CSV</Button>
          </div>
          <form>
            <FormGroup controlId="export-file">
              <ControlLabel>Select File</ControlLabel>
              <InputGroup>
                <FormControl
                  type="text"
                  value={fileName}
                />
                <InputGroup.Button>
                  <Button onClick={this.handleDialogOpen}>Browse</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <TextButton
            className="btn btn-default btn-sm"
            text="Cancel"
            clickHandler={handleClose} />
          <TextButton
            className="btn btn-primary btn-sm"
            dataTestId="insert-document-button"
            text="Export"
            clickHandler={this.handleExportClick} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;
