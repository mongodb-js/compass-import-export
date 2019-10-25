/* eslint-disable react/sort-comp */
/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';

// import styles from './progress-bar.less';
// import createStyler from 'utils/styler.js';
// import formatNumber from 'utils/format-number.js';

// const style = createStyler(styles, 'progress-bar');

class FieldTable extends PureComponent {
  static propTypes = {
    fields: PropTypes.array
  };

  toggleCheckAll(evt) {
    debugger;
  }

  onTabledUpdated() {
    debugger;
  }
  onAddRowClicked(evt) {
    debugger;
  }
  onRowAdded() {
    debugger;
  }
  onRowRemoved() {
    debugger;
  }

  render() {
    const fieldRowList = this.props.fields.map(field => {
      return <FieldRow field={field} />;
    });
    return (
      <div>
        <button
          type="button"
          onClick={this.onAddRowClicked.bind(this)}
          className="btn btn-success pull-right"
        >
          Add
        </button>
        <table className="table table-bordered table-condensed">
          <thead>
            <tr>
              <th style={{ width: '20px', verticalAlign: 'middle' }}>
                <input
                  type="checkbox"
                  onChanage={this.toggleCheckAll.bind(this)}
                />
              </th>
              <th>key</th>
              <th>type</th>
            </tr>
          </thead>

          <tbody>{fieldRowList}</tbody>
        </table>
      </div>
    );
  }
}

class FieldRow extends PureComponent {
  static propTypes = {
    field: PropTypes.object
    // checked: PropTypes.bool,
    // type: PropTypes.string
  };

  onRemoveClicked(evt) {
    debugger;
  }

  onCheckedChanaged(evt) {
    debugger;
  }

  render() {
    const { key, checked, type } = this.props.field;
    return (
      <tr className="eachRow">
        <CheckedCell
          checked={checked}
          onCheckedChanaged={this.onCheckedChanaged.bind(this)}
        />
        <EditableKeyCell fieldType={type} fieldKey={key} />
        <EditableTypeCell fieldType={type} fieldKey={key} />
      </tr>
    );
  }
}

class CheckedCell extends PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onCheckedChanaged: PropTypes.func
  };

  render() {
    return (
      <td>
        <input
          type="checkbox"
          checked={this.props.checked}
          onChange={this.props.onCheckedChanaged}
        />
      </td>
    );
  }
}

class EditableKeyCell extends PureComponent {
  static propTypes = {
    fieldKey: PropTypes.string,
    fieldType: PropTypes.string
  };

  onChange(evt) {
    debugger;
  }

  render() {
    const { fieldKey } = this.props;
    return (
      <td>
        <input
          type="text"
          name={fieldKey}
          id={fieldKey}
          value={fieldKey}
          onChange={this.onChange.bind(this)}
        />
      </td>
    );
  }
}

class EditableTypeCell extends PureComponent {
  static propTypes = {
    fieldKey: PropTypes.string,
    fieldType: PropTypes.string
  };

  onChange(evt) {
    debugger;
  }
  render() {
    const { fieldKey, fieldType } = this.props;
    /**
     * TODO: lucas: make this a select.
     */
    return (
      <td>
        <input
          type="text"
          name={fieldKey}
          id={fieldKey + fieldType}
          value={fieldType}
          onChange={this.onChange.bind(this)}
        />
      </td>
    );
  }
}

export default FieldTable;
export { EditableTypeCell, EditableKeyCell, FieldRow };
