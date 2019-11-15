import { Tooltip } from 'hadron-react-components';
import ExportField from 'components/export-field';
import React, { Component } from 'react';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';


import styles from './export-select-fields.less';
import createStyler from 'utils/styler.js';
const style = createStyler(styles, 'export-select-fields');

const fieldInfoSprinkle = 'The fields displayed are from a sample of documents in the collection. To ensure all fields are exported, add missing field names.';

class ExportSelectFields extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    updateFields: PropTypes.func.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.fields, nextProps.fields);
  }

  handleFieldCheckboxChange = (evt) => {
    const fields = this.props.fields;
    fields[`${evt.target.name}`] ^= fields[evt.target.name]; // flip 1/0 to its opposite
    this.props.updateFields(fields);
  }

  renderFieldRows() {
    return Object.keys(this.props.fields).map((field, index) => (
      <ExportField
        field={field}
        index={index}
        onChange={this.handleFieldCheckboxChange}
        checked={this.props.fields[field]}/>
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
