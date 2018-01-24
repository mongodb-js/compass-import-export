import React, { PureComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { TextButton } from 'hadron-react-buttons';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import QueryViewer from './query-viewer';

import styles from './export-modal.less';

/**
 * Export modal dialog.
 */
class ExportModal extends PureComponent {

  static displayName = 'ExportModalComponent';

  static propTypes = {
    count: PropTypes.number.isRequired,
    cancelExport: PropTypes.func.isRequired,
    exportCollection: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    query: PropTypes.object.isRequired
  };

  /**
   * Render the modal dialog.
   *
   * @returns {React.Component} The react component.
   */
  render() {
    return (
      <Modal show={this.props.isOpen} backdrop="static">
        <Modal.Header>
          <Modal.Title>Export Collection</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={classnames(styles['export-modal-info'])}>
            Exporting {this.props.count} documents returned by the following query:
          </div>
          <div className={classnames(styles['export-modal-query'])}>
            <QueryViewer query={this.props.query} />
          </div>
          <div className={classnames(styles['export-modal-output'])}>
            Select Output File Type
          </div>
          <div className={classnames(styles['export-modal-output-select'])}>
          </div>
          <div className={classnames(styles['export-modal-file'])}>
            Select File
          </div>
          <div className={classnames(styles['export-modal-file-select'])}>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <TextButton
            className="btn btn-default btn-sm"
            text="Cancel"
            clickHandler={this.props.cancelExport} />
          <TextButton
            className="btn btn-primary btn-sm"
            dataTestId="insert-document-button"
            text="Export"
            clickHandler={this.props.exportCollection} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;
