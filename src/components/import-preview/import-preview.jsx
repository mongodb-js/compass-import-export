/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { flatten } from 'flat';

import styles from './import-preview.less';

import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'import-preview');

import { createLogger } from 'utils/logger';
const debug = createLogger('import-preview');

/**
 * TODO: lucas: For COMPASS-3947, use <SelectFieldType />
 */

const HeaderShape = PropTypes.shape({
  path: PropTypes.string,
  checked: PropTypes.bool,
  type: PropTypes.string
});

/**
 * Plain object with arbitrary properties enriched with any BSON types.
 */
const DocumentShape = PropTypes.object;

class PreviewDocuments extends PureComponent {
  static propTypes = {
    docs: PropTypes.arrayOf(DocumentShape)
  };
  render() {
    const rows = this.props.docs.map((doc, i) => {
      const data = flatten(doc);
      const cells = Object.keys(data).map(k => {
        return <td key={k}>{data[k]}</td>;
      });
      return <tr key={i}>{cells}</tr>;
    });
    return <tbody>{rows}</tbody>;
  }
}

class PreviewHeaders extends PureComponent {
  static propTypes = {
    headers: PropTypes.arrayOf(HeaderShape)
  };

  onTypeChange(evt) {
    debug('Header Type Changed', evt);
  }
  onCheckedChanged(evt) {
    debug('Header Checked Changed', evt);
  }

  render() {
    const headers = this.props.headers.map(header => {
      return (
        <th key={header.path} className={header.path}>
          <div className="header-item">
            <input
              type="checkbox"
              checked={header.checked}
              onChange={this.onCheckedChanged}
            />
            <div className={style('type-and-key-header')}>
              <span className="header-path">{header.path}</span>
            </div>
          </div>
        </th>
      );
    });
    return (
      <thead>
        <tr>{headers}</tr>
      </thead>
    );
  }
}

class ImportPreview extends PureComponent {
  static propTypes = {
    headers: PropTypes.arrayOf(HeaderShape),
    docs: PropTypes.array
  };
  render() {
    return (
      <div className={style()}>
        <table className="table table-condensed">
          <PreviewHeaders headers={this.props.headers} />
          <PreviewDocuments docs={this.props.docs} />
        </table>
      </div>
    );
  }
}

export default ImportPreview;
