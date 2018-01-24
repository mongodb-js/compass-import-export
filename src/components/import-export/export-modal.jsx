import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, FormGroup, InputGroup, FormControl, ControlLabel } from 'react-bootstrap';

const { dialog } = require('electron').remote;

class ExportModal extends Component {

  static propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func.isRequired
  }

  handleDialogOpen() {
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] });
  }

  render() {
    const { open, handleClose } = this.props;
    return (
      <Modal show={open} onHide={handleClose} >
        <Modal.Header closeButton>
          Export Collection
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup controlId="export-file">
              <ControlLabel>Select Output File Type</ControlLabel>
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
          Footer
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;
