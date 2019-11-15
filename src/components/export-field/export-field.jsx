import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import styles from './export-field.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-field');

class ExportField extends PureComponent {
  static propTypes = {
    field: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    index: PropTypes.number,
    checked: PropTypes.number
  };

  render() {
    return (
      <tr key={this.props.field}>
        <td>
          <input type="checkbox"
            aria-label={`Include ${this.props.field} in exported collection`}
            id={this.props.index}
            name={this.props.field}
            onChange={this.props.onChange}
            checked={this.props.checked}/>
        </td>
        <td className={style('field-number')}>{this.props.index + 1}</td>
        <td>{this.props.field}</td>
      </tr>
    );
  }
}

export default ExportField;
