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

class PreviewRow extends PureComponent {
  static propTypes = {
    values: PropTypes.array,
    fields: PropTypes.array
  };
  // TODO: lucas: switch to for ... in
  render() {
    const { values } = this.props;
    const cells = values.map((v, i) => {
      const header = this.props.fields[i];
      if (!header.checked) {
        return (
          <td
            className="unchecked"
            title={`${header.path} of type ${header.type} is unchecked`}
          >
            {v}
          </td>
        );
      }
      return <td>{v}</td>;
    });
    return <tr>{cells}</tr>;
  }
}

class PreviewValues extends PureComponent {
  static propTypes = {
    values: PropTypes.array,
    fields: PropTypes.array
  };

  render() {
    const { values } = this.props;
    return (
      <tbody>
        {values.map(val => (
          <PreviewRow fields={this.props.fields} values={val} />
        ))}
      </tbody>
    );
  }
}

const FieldShape = PropTypes.shape({
  path: PropTypes.string,
  checked: PropTypes.bool,
  type: PropTypes.string
});

class PreviewFields extends PureComponent {
  static propTypes = {
    fields: PropTypes.arrayOf(FieldShape),
    onCheckedChanged: PropTypes.func.isRequired
  };

  onCheckedChanged(path, evt) {
    debug('Header Checked Changed', evt);
    this.props.onCheckedChanged(path, evt.currentTarget.checked);
  }

  render() {
    const fields = this.props.fields.map(field => {
      return (
        <th key={field.path}>
          <input
            type="checkbox"
            checked={field.checked}
            onChange={this.onCheckedChanged.bind(this, field.path)}
          />
          <span className="field-path">{field.path}</span>
        </th>
      );
    });
    return (
      <thead>
        <tr>{fields}</tr>
      </thead>
    );
  }
}

class ImportPreview extends PureComponent {
  static propTypes = {
    fields: PropTypes.arrayOf(FieldShape),
    values: PropTypes.array,
    onFieldCheckedChanged: PropTypes.func.isRequired
  };
  render() {
    return (
      <div className={style()}>
        <table className="table table-condensed">
          <PreviewFields
            fields={this.props.fields}
            onCheckedChanged={this.props.onFieldCheckedChanged}
          />
          <PreviewValues
            fields={this.props.fields}
            values={this.props.values}
          />
        </table>
      </div>
    );
  }
}

export default ImportPreview;
