import { Tooltip, InfoSprinkle } from 'hadron-react-components';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import styles from './export-select-fields.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-fields');

const fieldInfoSprinkle = 'The fields displayed are from a sample of documents in the collection.To ensure all fields are exported, add missing field names.';

class ExportSelectFields extends PureComponent {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    updateFields: PropTypes.func.isRequired,
  };

  handleFieldCheckboxChange = (evt) => {
    const fields = this.props.fields;
    fields[`${evt.target.name}`] ^= fields[evt.target.id]; // flip 1/0 to its opposite
    this.props.updateFields(fields);
  }

  renderFieldRows() {
    const fields = this.props.fields;

    console.log('FIELDS UPDATED', fields);

    return Object.keys(fields).map((field, index) => (
      <tr key={field}>
        <td>
          <input type="checkbox"
            aria-label={`Include ${field} in exported collection`}
            id={field}
            data-id={index}
            name={field}
            onChange={this.handleFieldCheckboxChange}
            checked={fields[field]}/>
        </td>
        <td className={style('field-number')}>{index + 1}</td>
        <td>{field}</td>
      </tr>
    ));
  }

  render() {
    return (
      <div>
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
        <div className={style('field-wrapper')}>
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
      </div>
    );
  }
}

export default ExportSelectFields;
