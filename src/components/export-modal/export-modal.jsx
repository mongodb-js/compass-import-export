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
    ns: PropTypes.string.isRequired,
    count: PropTypes.number,
    query: PropTypes.object.isRequired,
    exportCollection: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired,
    fileType: PropTypes.string,
    fileName: PropTypes.string
  };

  handleDialogOpen = () => {
    const file = fileOpenDialog(this.props.fileType);
    if (file) {
      this.props.selectExportFileName(file[0]);
    }
  }

  handleExportClick = () => {
    if (this.props.fileName) {
      this.props.exportCollection(this.props.fileName, this.props.fileType);
    }
  }

  render() {
    const { open, count, query, handleClose } = this.props;
    return (
      <Modal show={open} onHide={handleClose} >
        <Modal.Header closeButton>
          Export Collection {this.props.ns}
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
            name="file-type-selector">
            <Button
              className={classnames({[styles.selected]: this.props.fileType === FILE_TYPES.JSON})}
              onClick={this.props.selectExportFileType.bind(this, FILE_TYPES.JSON)}>JSON</Button>
            <Button
              className={classnames({[styles.selected]: this.props.fileType === FILE_TYPES.CSV})}
              onClick={this.props.selectExportFileType.bind(this, FILE_TYPES.CSV)}>CSV</Button>
          </div>
          <form>
            <FormGroup controlId="export-file">
              <ControlLabel>Select File</ControlLabel>
              <InputGroup>
                <FormControl type="text" value={this.props.fileName} readOnly />
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
