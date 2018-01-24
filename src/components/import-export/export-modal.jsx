import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Modal, Button, FormGroup, InputGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { TextButton } from 'hadron-react-buttons';

import QueryViewer from 'components/import-export/query-viewer';

import styles from './export-modal.less';

const { dialog } = require('electron').remote;

const FILE_TYPES = {
  CSV: 'CSV',
  JSON: 'JSON'
};

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
    const file = dialog.showOpenDialog({
      title: `Select ${fileType} target file`,
      filters: [{
        name: `${fileType} file`,
        extensions: [fileType.toLowerCase()]
      }],
      properties: ['openFile', 'createDirectory', 'promptToCreate']
    });

    this.setState({ fileName: file[0] });
  }

  render() {
    const { open, count, query, handleClose, exportCollection } = this.props;
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
          <form>
            <FormGroup controlId="export-file">
              <ControlLabel>Select File</ControlLabel>
              <InputGroup>
                <FormControl
                  type="text"
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
          clickHandler={exportCollection} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;
