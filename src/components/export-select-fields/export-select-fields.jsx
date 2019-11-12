import { Tooltip, InfoSprinkle } from 'hadron-react-components';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import styles from './export-select-fields.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-fields');

const fieldInfoSprinkle = 'The fields displayed are from a sample of documents in the collection.To ensure all fields are exported, add missing field names.'

class ExportSelectFields extends PureComponent {
  static propTypes = {
    fields: PropTypes.array.isRequired,
    updateFields: PropTypes.func.isRequired
  };

  renderFieldRows() {
    return this.props.fields.map((field, index) => (
      <tr key={field}>
        <td><input type="checkbox" id={field} name={field} checked/></td>
        <td className={style('field-number')}>{index + 1}</td>
        <td>{field}</td>
      </tr>
    ))
  }

  render() {
    return (
      <div className={style('field-wrapper')}>
        <div className={style('caption')}>
          <p>Select Fields</p>
          <div
            data-tip={fieldInfoSprinkle}
            data-for="field-tooltip"
            data-place="top">
            <i className="fa fa-info-circle" />
            <Tooltip id="field-tooltip" />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" name="Select All"/></th>
              <th>&nbsp;</th>
              <th colSpan="2" className={style('field-name')}>Field Name</th>
            </tr>
          </thead>
          <tbody>
            {this.renderFieldRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ExportSelectFields;
