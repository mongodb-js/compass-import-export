/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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
    fields: PropTypes.array,
    index: PropTypes.number
  };

  render() {
    const { values, index } = this.props;
    const cells = values.map((v, i) => {
      const header = this.props.fields[i];
      if (v === '') {
        v = <i>empty string</i>;
      }
      if (!header.checked) {
        return (
          <td
            className="unchecked"
            title={`${header.path} of type ${header.type} is unchecked`}>
            {v}
          </td>
        );
      }
      return <td>{v}</td>;
    });

    return <tr>{[].concat(<td>{index + 1}</td>, cells)}</tr>;
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
        {values.map((val, i) => (
          <PreviewRow fields={this.props.fields} values={val} index={i} />
        ))}
      </tbody>
    );
  }
}

// const FieldShape = PropTypes.shape({
//   path: PropTypes.string,
//   checked: PropTypes.bool,
//   type: PropTypes.string
// });

class PreviewFields extends PureComponent {
  static propTypes = {
    fields: PropTypes.array,
    onCheckedChanged: PropTypes.func.isRequired
  };

  onCheckedChanged(path, evt) {
    debug('Header Checked Changed', evt);
    this.props.onCheckedChanged(path, evt.currentTarget.checked);
  }

  render() {
    const fields = this.props.fields.map((field) => {
      return (
        <th key={field.path}>
          <div>
            <input
              type="checkbox"
              checked={field.checked}
              title={
                field.checked
                  ? `${field.path} values will be imported`
                  : `Values for ${field.path} will be ignored`
              }
              onChange={this.onCheckedChanged.bind(this, field.path)}
            />
            <ul>
              <li>{field.path}</li>
            </ul>
          </div>
        </th>
      );
    });
    return (
      <thead>
        <tr>{[].concat(<th />, fields)}</tr>
      </thead>
    );
  }
}

class ImportPreview extends PureComponent {
  static propTypes = {
    fields: PropTypes.array,
    values: PropTypes.array,
    onFieldCheckedChanged: PropTypes.func.isRequired
  };
  render() {
    return (
      <div className={style()}>
        <table>
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
