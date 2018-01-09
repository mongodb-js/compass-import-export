import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import fs from 'fs';
import streamToObservable from 'stream-to-observable';

import { nsChanged } from 'modules/ns';

import ImportButton from './import-button';
import ExportButton from './export-button';
import ProgressBar from './progress-bar';

import exportCollection from 'utils/export';
import importCollection from 'utils/import';
import SplitLines from 'utils/split-lines-transform';

import styles from './import-export.less';

class ImportExport extends Component {
  static displayName = 'ImportExportComponent';

  static propTypes = {
    dataService: PropTypes.object.isRequired
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
    const { client: { database } } = this.props.dataService;
    const fws = fs.createWriteStream('export-file.json');

    database.collection('users').stats()
      .then(
        ({ size: collectionSize }) => {
          exportCollection(database, 'users')
            .subscribe(
              data => {
                this.setState({ progress: (fws.bytesWritten * 100) / collectionSize });
                fws.write(data);
              },
              err => console.error(err),
              () => this.setState({ progress: 100 })
            );
        }
      );
  }

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

  /**
   * Render ImportExport component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <div className={classnames(styles['import-export'])}>
        <p>Compass Import/Export Plugin</p>
        <ImportButton importHandler={ this.handleImport } />
        <ExportButton exportHandler={ this.handleExport } />
        { this.state.progress > 0 ? <ProgressBar progress={ this.state.progress } /> : null }
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
  dataService: state.dataService
});

/**
 * Export the connected component as the default.
 */
export default connect(
  mapStateToProps,
  { nsChanged }
)(ImportExport);
