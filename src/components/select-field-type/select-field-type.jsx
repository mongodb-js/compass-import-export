/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { createLogger } from 'utils/logger';
const debug = createLogger('select-field-type');

class SelectFieldType extends PureComponent {
  static propTypes = {
    selectedType: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };

  onChange(evt) {
    debug('type changed', evt.currentTarget.value);
    this.props.onChange(evt.currentTarget.value);
  }
  render() {
    const { selectedType } = this.props;
    const onChange = this.onChange.bind(this);

    /**
     * TODO: lucas: Make list of potential types real.
     */

    return (
      <select defaultValue={selectedType} onChange={onChange}>
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
      </select>
    );
  }
}
export default SelectFieldType;
