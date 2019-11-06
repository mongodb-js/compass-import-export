import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ProgressBar from 'components/progress-bar';
import ErrorBox from 'components/error-box';
import SelectFileType from 'components/select-file-type';
import { IconTextButton } from 'hadron-react-buttons';
import fileSaveDialog from 'utils/file-save-dialog';
import {
  FormGroup,
  InputGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';

import {
  STARTED,
  CANCELED,
  COMPLETED,
  UNSPECIFIED
} from 'constants/process-status';

import styles from './export-select-output.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-select-output');

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

class ExportSelectOutput extends PureComponent {
  static propTypes = {
    count: PropTypes.number,
    progress: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    error: PropTypes.object,
    startExport: PropTypes.func.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired,
    cancelExport: PropTypes.func.isRequired,
    fileType: PropTypes.string,
    fileName: PropTypes.string,
    exportedDocsCount: PropTypes.number
  };

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

  /**
   * Handle choosing a file from the file dialog.
   */
  handleChooseFile = () => {
    const file = fileSaveDialog(this.props.fileType);
    if (file) {
      this.props.selectExportFileName(file);
    }
  };

  /**
   * Render the component.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <div>
        <form onSubmit={this.handleOnSubmit} className={style('form')}>
          <SelectFileType
            fileType={this.props.fileType}
            onSelected={this.props.selectExportFileType}
            label="Select Output File Type"
          />
          <FormGroup controlId="export-file">
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
        </form>
        <ProgressBar
          progress={this.props.progress}
          status={this.props.status}
          message={MESSAGES[this.props.status]}
          cancel={this.props.cancelExport}
          docsWritten={this.props.exportedDocsCount}
          docsTotal={this.props.count}
        />
        <ErrorBox error={this.props.error} />
      </div>
    );
  }
}
export default ExportSelectOutput;
