import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import fs from 'fs';
import streamToObservable from 'stream-to-observable';

import { nsChanged } from 'modules/ns';
import { exportStarted } from 'modules/export';

import ImportButton from './import-button';
import ExportButton from './export-button';
import ProgressBar from './progress-bar';
import CancelButton from './cancel-button';

import importCollection from 'utils/import';
import SplitLines from 'utils/split-lines-transform';

import styles from './import-export.less';

class ImportExport extends Component {
  static displayName = 'ImportExportComponent';

  static propTypes = {
    dataService: PropTypes.object.isRequired,
    exportStarted: PropTypes.func.isRequired,
    exportProgress: PropTypes.number
  };

  state = {
    progress: 0
  };

  componentWillUpdate() {
    if (this.state.progress === 100) {
      setTimeout(() => this.setState({ progress: 0 }), 2000);
    }
  }

  handleExport = () => {
    this.props.exportStarted('users');
  };

  handleImport = () => {
    const { client: { database } } = this.props.dataService;
    const stats = fs.statSync('export-file.json');
    const fileSizeInBytes = stats.size;
    const frs = fs.createReadStream('export-file.json', 'utf8');
    const splitLines = new SplitLines();

    frs.pipe(splitLines);
    importCollection(database, 'users_3', streamToObservable(splitLines))
      .subscribe(
        () => this.setState({ progress: (frs.bytesRead * 100) / fileSizeInBytes }),
        err => console.log(err),
        () => this.setState({ progress: 100 })
      );
  }

  handleCancel = () => {}

  /**
   * Render ImportExport component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['import-export'])}>
        <p>Compass Import/Export Plugin</p>
        <ImportButton onClick={ this.handleImport } />
        <ExportButton onClick={ this.handleExport } />
        {
          this.props.exportProgress > 0 || this.state.progress > 0
            ? (
              <div>
                <ProgressBar progress={ this.props.exportProgress } />
                <CancelButton onClick={ this.handleCancel } />
              </div>
            )
            : null
        }
      </div>
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
const mapStateToProps = (state) => ({
  ns: state.ns,
  dataService: state.dataService,
  exportProgress: state.exportData.progress
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  { nsChanged, exportStarted }
)(ImportExport);
